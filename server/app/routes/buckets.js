const express = require('express')
const xml2js = require('xml2js')
const router = express.Router()
const Buckets = require("../models/buckets")
const File = require("../models/file")
const crypto = require('crypto')
const Bucket = require('../models/buckets')
const { DataBrew } = require('aws-sdk')
const { SelectObjectContentEventStreamFilterSensitiveLog } = require('@aws-sdk/client-s3')
//Get ALL Buckets
router.get('/', async (req, res) => {
  try {
    const buckets = await Buckets.find()
    xmlBuckets = convertToXML(buckets)
    res.send(xmlBuckets)
  }
  catch (err) {
    res.status(500).json({message: err.message})
  }
})

//Get ONE bucket
router.get('/:id', getBucket, async (req, res) => {
  try {
    parseBucket = convertToSingleXML(res.bucket)
    res.send(parseBucket)
  }
  catch (err) {
    res.status(500).json({message: err.message})
  }
})

// GET ONE BUCKET, AND FILES

router.get('/:id/files', getBucket, async (req, res) => {
  try {
    const files = await File.find({bucket_key: req.params.id})
    console.log(files)
    const parsedData = convertToJoinedXML(res.bucket, files)
    res.send(parsedData)
  }
  catch (err) {
    res.status(500).json({message:err.message})
  }
})

// Upload file to Bucket
router.post('/:id/files', getBucket, async (req,res)=>{
  const file = new File({
    bucketKey: String(new ObjectId(req.bucket.bucketKey)),
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
//Create Bucket
router.post('/', async (req,res) => {
  const newKey = generateAPIKey()
  const bucket = new Buckets({
    bucketKey: newKey,
    bucketName: req.body.bucket_name,
    attachedAccess: [req.body.attached_access],
    attachedSecret: [req.body.attached_secret],
  })
  try {
    const newBucket = await bucket.save()
    res.status(201).json(newBucket)
  }
  catch (err) {
    res.status(400).json({message: err.message})
  }
})

// Add access and secret key access to a bucket
router.post('/:id', getBucket, async (req, res) => {
 try{
  if (!req.body.attached_access || !req.body.attached_secret) {
    throw new Error("Access/Secret Key can not be empty!")
  }
  res.bucket.attachedAccess.push(req.attachedAccess)
  res.bucket.attachedSecret.push(req.attachedSecret)
  await res.bucket.save();

  response = convertToSingleXML(res.bucket)

  res.status(200).json(response)
 }
catch (err) {
  res.status(400).json({message: err.message})
}
})

//Update Buckets
router.put('/:id', async (req,res) =>{
  try {
    bucket = await Buckets.findOneAndUpdate({_id: req.params.id}, {$set: req.body})
    res.status(200)
    updatedBucket = await Buckets.findById(req.params.id)
    parseBucket = convertToSingleXML(updatedBucket)
    res.send(parseBucket)
  }
  catch (err) {
    res.status(400).json({message: err.message})
  }
})

// Delete bucket
router.delete('/:id', getBucket, async (req, res) => {
  try {
    await res.bucket.remove();
    const builder = new xml2js.Builder({ rootName: 'GetBucketResult', headless: false, explicitArray: false })
    const xml = builder.buildObject({Message: "Bucket successfully Deleted!"})
    res.send(xml)
  }
  catch (err) {
    res.status(500).json({message: err.message})
  }
})
async function getBucket(req, res, next) {
  let bucket;
  try {
    bucket = await Buckets.findById(req.params.id)
    if (!bucket) {
      return res.status(400).json({message: "Cannot find bucket"})
    }
  }
  catch (err) {
    return res.status(500).json({message: err.message})
  }
  res.bucket = bucket
  next()
}

function convertToSingleXML(data) {
  id = data._id.toString()
  console.log(data)
  const builder = new xml2js.Builder({ rootName: 'GetBucketResult', headless: false })
  const holder = {id:id, bucketKey: data.bucketKey, bucketName: data.bucketName, files: data.files, publicAccess: data.publicAccess, creationDate: String(data.creationDate)}
  for (let i = 0; i < data.acceptedUserKeys.length; i++) {
    holder[`acceptedUserKey-${i+1}`] = data.acceptedUserKeys[i].toString()
  }
  const xml = builder.buildObject(holder)

  return xml
}

function convertToXML(data) {
  const holder = []
  for (let i = 0; i < data.length; i++) {
    const bit = data[i]
    id = bit._id.toString()
    holder[i] = {id:id, bucketKey: bit.bucketKey, bucketName: bit.bucketName, files: bit.files, publicAccess: bit.publicAccess, creationDate: String(bit.creationDate)}
  }
  const builder = new xml2js.Builder({ rootName: 'GetBucketResult', headless: false, explicitArray:false})
  const xml = builder.buildObject(holder)

  return xml
}


function generateAPIKey() {
  const apiKeyLength = 23; // You can adjust the length as needed
  const apiKey = crypto.randomBytes(apiKeyLength).toString('hex');
  return apiKey;
}

function convertToJoinedXML(data, joinedData) {
  id = data._id.toString()
  // joinedData is the files connected to the BucketID
  console.log(joinedData)
  const builder = new xml2js.Builder({ rootName: 'GetBucketResult', headless: false, explicitArray: false })
  const xml = builder.buildObject(data, joinedData)
  return xml
}

module.exports = router
