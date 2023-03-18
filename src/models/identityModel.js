const mongoose = require('mongoose')

const userIdSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  id: {
    type: String,
    required: true,
    unique: true
  }
})

const UserId = mongoose.model('UserId', userIdSchema)
module.exports = UserId
