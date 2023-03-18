const mongoose = require('mongoose')

module.exports = function connectToDB (url, isConnect) {
  if (isConnect) {
    try {
      mongoose.set('strictQuery', true)
      console.log('connecting...')
      return mongoose
        .connect(url, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        })
        .then(() => console.log('connected to Database ✓ ✓ ✓ ✓'))
    } catch (e) {
      console.log(e.message)
    }
  }
  return console.log(
    'no database connection. \nData will be saved locally in output.txt'
  )
}
