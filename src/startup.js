const connectDB = require('../src/DB/connect')

require('dotenv').config()
const { MONGO_URI } = process.env

module.exports = async app => {
  const PORT = process.env.PORT || 4300

  app.use('/raybags/v1/wizard/*', (req, res, next) => {
    let newUrl = req.url.replace(
      '/raybags/v1/wizard/',
      `http://${PORT}/raybags/v1/wizard/`
    )
    req.url = newUrl
    next()
  })

  app.listen(PORT, async () => {
    try {
      console.log(`server up on port: ${PORT}`)
      await connectDB(MONGO_URI, true)
    } catch (e) {
      console.log(e.message)
    }
  })
}
