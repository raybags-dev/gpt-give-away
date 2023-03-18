const mongoose = require('mongoose')

const ResponseModel = {
  question: {
    type: String,
    maxlength: 10000,
    minlength: 1
  },
  response: {
    type: String,
    maxlength: 2147483647,
    minlength: 1
  },
  token: {
    type: String,
    maxlength: 500,
    minlength: 3
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}

const GPT_RESPONSE_SCHEMA = new mongoose.Schema(ResponseModel, {
  timestamps: true
})

module.exports = {
  GPT_RESPONSE: mongoose.model('gpt-collection', GPT_RESPONSE_SCHEMA)
}
