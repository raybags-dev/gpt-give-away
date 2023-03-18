const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userIdSchema = new mongoose.Schema({}, { timestamps: true })

const userModel = {
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 5,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 1024
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserId',
    required: true
  }
}

const userSchema = new mongoose.Schema(userModel, {
  timestamps: true
})

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    process.env.MY_SECRET
  )
  return token
}

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email })
  if (!user) {
    throw new Error('Invalid login credentials')
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new Error('Invalid login credentials')
  }
  return user
}

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8)
  }
  next()
})

module.exports = {
  USER_MODEL: mongoose.model('User', userSchema),
  USER_ID_MODEL: mongoose.model('UserId', userIdSchema)
}
