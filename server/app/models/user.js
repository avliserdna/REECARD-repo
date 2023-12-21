const mongoose = require('mongoose')
const {Schema, model} = mongoose

const userSchema = new Schema(
  {

    userName: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    accessKey: {
      type: String,
      // required: true
    },
    secretKey: {
      type: String,
      // required: true
    },
    creationDate: {
      type: Date,
      required: true,
      default: Date.now()
    }
  },
  {collection: 'users'}
)
const User = model('User', userSchema)
module.exports = User;
