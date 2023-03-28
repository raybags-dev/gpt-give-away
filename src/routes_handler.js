const {
  // Authenticate,
  CreateUser,
  Login,
  AskGPT,
  GetAllResults,
  GetAll,
  DeleteOne,
  FindOneItem,
  DeleteAll,
  deleteAllForUser,
  FindUser,
  deleteUserAndOwnDocs,
  NotSupported
} = require('../functions/router')

module.exports = async app => {
  CreateUser(app)
  Login(app)
  AskGPT(app)
  GetAllResults(app)
  GetAll(app)
  DeleteOne(app)
  FindOneItem(app)
  deleteAllForUser(app)
  DeleteAll(app)
  FindUser(app)
  deleteUserAndOwnDocs(app)
  app.use(NotSupported)
}
