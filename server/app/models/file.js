const mongoose = require('mongoose')
const {Schema, model} = mongoose;

const fileSchema = new Schema (
  {
    bucketKey: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Bucket"
    },
    fileKey: {
      type: String,
      require: true
    },
    fileName: {
      type: String,
      require: true
    },
    fileType: {
      type: String,
      require: true
    }
  },
  {
    collection: 'files'
  }
)
const File = model('File', fileSchema)

module.exports = File;
