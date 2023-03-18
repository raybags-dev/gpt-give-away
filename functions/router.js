const express = require('express')
const app = express()
const apicache = require('apicache')

const path = require('path')
const { ObjectId } = require('mongodb')
require('dotenv').config()
const { GPT_5 } = require('../gptEngine/runners')
const asyncMiddleware = require('../middleware/asyncErros')
// cache
let cache = apicache.middleware

const {
  loginUser,
  authMiddleware,
  extractTokenMiddleware,
  checkDocumentAccess,
  isAdmin,
  checkUserExists
} = require('../middleware/auth')
const { USER_MODEL, USER_ID_MODEL } = require('../src/models/user')
const { GPT_RESPONSE } = require('../src/models/responseModel')
const { default: mongoose } = require('mongoose')
//fallback page path
const fallbackPagePath = path.join(__dirname, '../errorPage/noConnection.html')
// create user
async function CreateUser (app) {
  app.post('/raybags/v1/wizard/users', async (req, res) => {
    try {
      const { name, email, password, isAdmin } = req.body
      // Check if user already exists in the database
      const existingUser = await USER_MODEL.findOne({ email })
      if (existingUser) {
        return res.status(409).send({ error: 'User already exists' })
      }
      // Create a new userId document and extract its _id
      const newUserId = await USER_ID_MODEL.create({})
      const userId = newUserId._id
      // Create a new user instance and save it to the database
      const user = new USER_MODEL({ name, email, password, userId, isAdmin })
      await user.save()
      // Generate a JWT for the user and send back the newly created user and JWT as a response
      const token = user.generateAuthToken()
      res
        .status(201)
        .send({ user: { name, email, isAdmin: user.isAdmin }, token })
    } catch (error) {
      res.status(400).send({ error: error.message })
    }
  })
}
//login handler
async function Login (app) {
  app.post('/raybags/v1/wizard/login', loginUser, async (req, res) => {
    try {
      // Find the user based on the email in the request body
      const user = await USER_MODEL.findOne({ email: req.body.email })
      // Return the user object without the password
      const userObject = user.toObject()
      delete userObject.password
      res.json({ user: userObject })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Server error' })
    }
  })
}
function AskGPT (app) {
  app.post(
    '/raybags/v1/wizard/ask-me',
    extractTokenMiddleware,
    authMiddleware,
    asyncMiddleware(async (req, res) => {
      const question = req.body.data
      const cachedResponse = await GPT_RESPONSE.findOne({ question })
        .sort({ createdAt: -1 })
        .exec()

      console.log(req.user.userId)
      if (cachedResponse) {
        if (cachedResponse.user.toString() !== req.user.userId) {
          return res.status(401).json({ error: 'Unauthorized access' })
        }
        return res
          .status(200)
          .json({ status: 'Success', response: cachedResponse.response })
      }
      const response = await GPT_5(question)
      const cleanedResponse = response.replace(/[\r\n]{2,}/g, '\n').trim()
      const userId = req.user.userId
      try {
        const newResponse = new GPT_RESPONSE({
          question: question,
          response: cleanedResponse,
          user: mongoose.Types.ObjectId(userId)
        })

        await newResponse.save()
        return res
          .status(200)
          .json({ status: 'Success', response: cleanedResponse })
      } catch (error) {
        if (error.name === 'ValidationError') {
          if (error.errors.question) {
            return res.status(400).json({
              status: 'Bad request!',
              message: error.errors.question.message
            })
          }
          if (error.errors.response) {
            return res
              .status(400)
              .json({ status: 'Error', message: error.errors.response.message })
          }
          if (error.errors.user) {
            return res
              .status(400)
              .json({ status: 'Error', message: error.errors.user.message })
          }
        }

        return res.status(500).json({
          status: 'Error',
          message: 'An internal error occurred:  ' + error.message
        })
      }
    })
  )
}
function GetPaginatedResults (app) {
  app.get(
    '/raybags/v1/wizard/data',
    authMiddleware,
    asyncMiddleware(async (req, res) => {
      try {
        if (req.query.page <= '0') throw new Error(`Page can't be 0`)
        const page = req.query.page
        const limit = 10
        const skip = (page - 1) * limit
        const userId = req.user.userId // Updated this line to use userId instead of _id

        let response = await GPT_RESPONSE.find({ user: userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
        const totalPages = Math.ceil(
          (await GPT_RESPONSE.countDocuments({ user: userId })) / limit
        )
        if (!response.length) return res.status(404).json('No documents found!')
        res.status(200).json({ data: response, totalPages, currentPage: page })
        return response
      } catch (error) {
        if (error.message === `Page can't be 0`) {
          return res
            .status(400)
            .json({ status: 'Error', message: error.message })
        } else if (error.name === 'CastError' && error.path === 'page') {
          return res
            .status(400)
            .json({ status: 'Error', message: 'Page should be a number' })
        } else if (error instanceof mongoose.Error.ValidationError) {
          return res
            .status(400)
            .json({ status: 'Error', message: error.message })
        } else {
          console.error(error)
          return res
            .status(500)
            .json({ status: 'Error', message: 'An internal error occurred' })
        }
      }
    })
  )
}
function FindOneItem (app) {
  app.get(
    '/raybags/v1/wizard/data/document/:id',
    authMiddleware,
    checkDocumentAccess,
    asyncMiddleware(async (req, res) => {
      try {
        const document = req.document
        res.status(200).json(document)
      } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Server error' })
      }
    })
  )
}
// delete one doc
function DeleteOne (app) {
  app.delete(
    '/raybags/v1/wizard/delete-document/:id',
    authMiddleware,
    asyncMiddleware(async (req, res) => {
      const itemId = req.params.id
      const userId = req.user.data._id
      let item = await GPT_RESPONSE.findOne({ _id: new ObjectId(itemId) })
      if (!item) return res.status(404).json('Item could not be found')
      // If the user is an admin, they can delete any document
      if (item && req.user.isAdmin) {
        await item.delete()
        return res.status(200).json({ message: 'Item deleted', item })
      }
      // If the user created the document, they can delete it
      if (item.user.toString() === userId.toString()) {
        await item.delete()
        return res.status(200).json({ message: 'Item deleted', item })
      }
      // Otherwise, the user cannot delete the document
      return res
        .status(401)
        .json({ message: 'You are not authorized to delete this item' })
    })
  )
}
// get all docs
function GetAll (app) {
  app.get(
    '/raybags/v1/wizard/data/documents-all',
    authMiddleware,
    asyncMiddleware(async (req, res) => {
      const isAdmin = req.user.isAdmin
      let response

      if (isAdmin) {
        response = await GPT_RESPONSE.find({}, { token: 0 }).sort({
          createdAt: 1
        })
      } else {
        response = await GPT_RESPONSE.find(
          { user: req.user.data._id },
          { token: 0 }
        ).sort({
          createdAt: 1
        })
      }
      if (response.length === 0)
        return res.status(404).json('Sorry I have nothing for you!')

      let page = parseInt(req.query.page) || 1
      let perPage = parseInt(req.query.perPage) || 10
      let totalPages = Math.ceil(response.length / perPage)
      res.status(200).json({
        totalPages: totalPages,
        totalCount: response.length,
        data: response
      })
      return response
    })
  )
}
// handle if user exists and then delete all their documents endpoint parameter is _id for user document .
function DeleteAll (app) {
  app.delete(
    '/raybags/v1/wizard/delete-all-documents/:userId',
    authMiddleware,
    checkUserExists,
    asyncMiddleware(async (req, res) => {
      const isAdmin = req.user.isAdmin
      const userId = req.params.userId

      // Check if user is an admin or deleting own documents
      if (isAdmin || userId === req.user.data._id) {
        const { acknowledged, deletedCount } = await GPT_RESPONSE.deleteMany({
          user: userId
        })
        if (acknowledged && deletedCount == 0)
          return res.status(202).json({ message: 'Deletion was a success.' })
        res.status(200).json({ message: 'All items deleted' })
      } else {
        res
          .status(401)
          .json({ message: 'You are not authorized to perform this action.' })
      }
    })
  )
}
// delete a user and all their docs
function deleteAllForUser (app) {
  app.delete(
    '/raybags/v1/wizard/delete-user/:userId',
    authMiddleware,
    isAdmin,
    asyncMiddleware(async (req, res) => {
      const userId = req.params.userId
      // Check if the user exists
      const user = await USER_MODEL.findById(
        { _id: userId },
        { isAdmin: 0, password: 0, _id: 0, userId: 0 }
      )
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      // Delete all documents associated with the user
      await GPT_RESPONSE.deleteMany({ user: userId })
      // Delete the user
      const { acknowledged } = await USER_MODEL.deleteOne({
        _id: userId
      })
      const { name, email, createdAt } = user
      res.status(200).json({
        status: acknowledged,
        user_profile: { username: name, user_email: email, createdAt },
        message: `User profile ${userId}, and all related documents has been deleted`
      })
    })
  )
}
function NotSupported (req, res, next) {
  res.status(502).sendFile(fallbackPagePath)
}
module.exports = {
  CreateUser,
  Login,
  AskGPT,
  GetPaginatedResults,
  GetAll,
  DeleteOne,
  FindOneItem,
  DeleteAll,
  NotSupported,
  deleteAllForUser
}
