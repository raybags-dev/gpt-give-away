const jwt = require('jsonwebtoken')
require('dotenv').config()
const { ACCESS_TOKEN } = process.env
const { USER_MODEL } = require('../src/models/user')
const { GPT_RESPONSE } = require('../src/models/responseModel')
module.exports = {
  // function to generate and encript a JWT token
  generateJWTToken: async data => {
    const expiresIn = 60000 // expiration time of token
    const payload = {
      data,
      email: data.email,
      userId: data._id,
      isAdmin: data.isAdmin
    } // include userId in token payload
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        ACCESS_TOKEN, //secret key
        { expiresIn },
        (err, token) => {
          if (err) reject(err)
          resolve(token)
        }
      )
    })
  },
  // login user
  loginUser: async (req, res, next) => {
    const { email = '', password = '' } = req.body
    try {
      // Check if user with email exists in database
      const user = await USER_MODEL.findOne({ email })
      if (!user) {
        return res.status(401).json({ error: 'You are not registered!' })
      }
      // Check if password matches user's password in database
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' })
      }
      // If user exists and password is correct, generate JWT token
      const token = await module.exports.generateJWTToken({
        email: user.email,
        _id: user._id,
        isAdmin: user.isAdmin // include isAdmin in token payload
      })
      // Set token in response header
      res.setHeader('authorization', `Bearer ${token}`)
      // Add the user object to the request object
      req.user = user.toObject()
      // Call next to proceed to next middleware/route handler
      next()
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Server error', message: error.message })
    }
  },
  //   extract token
  extractTokenMiddleware: (req, res, next) => {
    const authHeader = req.headers['authorization']
    if (authHeader) {
      const [bearer, token] = authHeader.split(' ')
      req.token = token
    }
    next()
  },
  // authMiddleware: async (req, res, next) => {
  //   // Check if Authorization header is present
  //   const authHeader = req.headers['authorization']
  //   if (!authHeader) {
  //     return res.status(401).json({ error: 'Missing Authorization header' })
  //   }
  //   // Extract JWT token from Authorization header
  //   const [bearer, token] = authHeader.split(' ')
  //   if (bearer !== 'Bearer' || !token) {
  //     return res.status(401).json({ error: 'Invalid Authorization header' })
  //   }
  //   // Verify and decode JWT token
  //   try {
  //     const decodedToken = jwt.verify(token, ACCESS_TOKEN)
  //     // Attach decoded token to request object for use in subsequent middleware or routes
  //     req.user = decodedToken
  //     req.token = token // Attach token to request object for use in subsequent middleware or routes
  //     // Check if the email address in the token matches the email address of the user making the request

  //     if (decodedToken.data.email !== req.body.email) {
  //       return res.status(401).json({ error: 'Unauthorized access' })
  //     }
  //     // Check if user with email exists in database
  //     const user = await USER_MODEL.findOne({ email: req.body.email })

  //     if (!user) {
  //       return res.status(401).json({ error: 'User not found' })
  //     }
  //     req.locals = { user } // attach user object to req.locals
  //     next()
  //   } catch (error) {
  //     return res
  //       .status(401)
  //       .json({ error: 'Invalid token', message: error.message })
  //   }
  // },
  authMiddleware: async (req, res, next) => {
    // Check if Authorization header is present
    const authHeader = req.headers['authorization']
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' })
    }
    // Extract JWT token from Authorization header
    const [bearer, token] = authHeader.split(' ')
    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Invalid Authorization header' })
    }
    // Verify and decode JWT token
    try {
      const decodedToken = jwt.verify(token, ACCESS_TOKEN)
      // Attach decoded token to request object for use in subsequent middleware or routes
      req.user = decodedToken
      req.token = token // Attach token to request object for use in subsequent middleware or routes

      // Check if the email address in the token matches the email address of the user making the request
      const userEmail = req.body.email
      if (!userEmail) {
        return res.status(401).json({ error: 'Missing email in request body' })
      }
      if (decodedToken.data.email !== userEmail) {
        return res.status(401).json({ error: 'Unauthorized access' })
      }

      // Check if user with email exists in database
      const user = await USER_MODEL.findOne({ email: userEmail })

      if (!user) {
        return res.status(401).json({ error: 'User not found' })
      }

      req.locals = { user } // attach user object to req.locals
      next()
    } catch (error) {
      return res
        .status(401)
        .json({ error: 'Invalid token', message: error.message })
    }
  },

  checkDocumentAccess: async (req, res, next) => {
    try {
      const { user } = req.locals // retrieve user object from req.locals
      const document = await GPT_RESPONSE.findById(req.params.id)

      if (!document) {
        return res.status(404).json({ error: 'Document not found' })
      }
      if (document.user.toString() !== user._id.toString() && !user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      req.document = document
      next()
    } catch (error) {
      console.error(error.message)
      res
        .status(500)
        .json({ error: 'Server error', message: 'Try again later' })
    }
  },
  //   check user is admin
  isAdmin: async (req, res, next) => {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: 'Access denied: admin privileges required' })
    }
    next()
  },
  //   check if user exist middleware
  checkUserExists: async (req, res, next) => {
    try {
      const { userId } = req.params
      const user = await USER_MODEL.findById(userId)

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      req.locals = { user } // attach user object to req.locals
      next()
    } catch (error) {
      console.error(error.message)
      res
        .status(500)
        .json({ error: 'Server error', message: 'Try again later' })
    }
  }
}
