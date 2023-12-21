const express = require('express')
const xml2js = require('xml2js')
const router = express.Router()
const Files = require('../models/file')
// get all Objects
router.get('/', async (req, res) => {

  try {

    const files = await Files.find()
    console.log(files)
    parseXML = await convertToXML(files)
    res.set('Content-Type', 'text/xml');
    res.send(parseXML)
  }
  catch (err) {
    res.status(500).json({message: err.message})
  }
})


// get ONE object
router.get('/:id', getObject, (req,res) => {
  try {
    parseXML = convertToSingleXML(res.file)
    res.send(parseXML)
  }
  catch (err) {
    res.status(500).json({message: err.message})
  }
})

// Upload Object
router.post('/', async (req,res)=>{
   const file = new Files({
    fileName: req.body.fileName,
    fileType: req.body.fileType
   })

   try {
    const newFile = await file.save()
    const parsedFile = await convertToSingleXML(newFile)
    res.send(parsedFile)
   }
   catch(err) {
    res.status(400).json({message: err.message})
   }
})

// Update Object
router.put('/:id', async (req,res) => {
  let file;
  let query = {_id: req.params.id}
  try {
    file = await Files.findOneAndUpdate(query, {$set: req.body})
    res.status(200)
    updateFile = await Files.findById(req.params.id)
    updatedXML = await convertToSingleXML(updateFile)
    res.set('Content-Type', 'text/xml');
    res.send(updatedXML)
  }
  catch (err) {
    res.status(400).json({message: err.message})
}

})
// Delete Object

router.delete('/:id', getObject, async (req,res) => {
  try {
    await res.file.remove();
    const builder = new xml2js.Builder({ rootName: 'DeleteFile', headless: false, explicitArray: false })
    const xml = builder.buildObject({Message: "File successfully deleted!", RemovedBucketID: req.params.id})
    res.send(xml)
  }
  catch (err) {
    res.status(500).json({message: err.message})
  }
})

async function getObject(req, res, next) {
  let file;
  try {
    file = await Files.findById(req.params.id)
    if (!file ) {
      return res.status(404).json({message: "Cannot find file!"})
    }
  }
  catch (err) {
    return res.status(500).json({message: err.message})
  }
  res.file = file
  next()
}

function convertToSingleXML(data) {
  id = data._id.toString()
  console.log(data)
  const builder = new xml2js.Builder({ rootName: 'GetFileResult', headless: false })
  holder = {id:id, bucketKey: data.bucketKey.toString(), fileName: data.fileName, fileType:data.fileType}
  const xml = builder.buildObject(holder)

  return xml
}

function convertToXML(data) {
  const holder = []
  for (let i = 0; i < data.length; i++) {
    const bit = data[i]
    id = bit._id.toString()
    holder[i] = {id:id, bucketKey: bit.bucketKey.toString(), fileName: bit.fileName, fileType:bit.fileType}
  }
  const builder = new xml2js.Builder({ rootName: 'GetFilesResult', headless: false, explicitArray:false})
  const xml = builder.buildObject(holder)

  return xml
}


// function convertGroupToXML(collection) {
//   for (obj of collection) {

//   }
// }
module.exports = router
