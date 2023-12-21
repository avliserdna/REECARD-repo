const express = require('express')
const xml2js = require('xml2js')
const router = express.Router()
const Users = require('../models/user')
const crypto = require('crypto')
const User = require('../models/user')

// get All users (TEST PURPOSES)
router.get('/' , async (req, res) => {
  try {
    const users = await User.find()
    parseXML = await convertToXML(users)
    res.set('Content-Type', 'text/xml');
    res.send(parseXML)
  }
  catch (err) {
    res.status(500).json({message: err.message})
  }
})

// GET ONE USER
router.get('/:id', getUser, (req, res) => {
  try {
    parseXML = convertUserXML(res.user)
    res.send(parseXML)
  }
  catch (err) {
    res.status(500).json({message: err.message})
  }
})

// MAKE NEW USER (FOR TESTING PURPOSES)

router.post('/', async (req, res) => {

  const newSecretKey = generateAPIKey()
  const user = new Users({
    userName: req.body.user_name,
    password : req.body.password,
    // access_key: newAccessKey,
    // secret_key: newSecretKey
  })
  try {
    const newUser = await user.save()
    res.status(201).json(newUser)
  }
  catch (err) {
    res.status(400).json({message: err.message})
  }
})

// Generate Access Key
router.post('/:id', getUser, async(req,res) => {
  const newAccessKey = generateAPIKey()
  req.user.accessKey = newAccessKey
  await req.user.save()

  xmlAccessKey = accessKeytoXML(req.user)
  return res.send(xmlAccessKey)
})

  // Gets a User's bucket
  router.get('/:id/buckets', getUser, async (req, res) => {

  })
// Gets a single user
async function getUser(req, res, next) {
  let user;
  try {
    user = await Users.findById(req.params.id)
    if (!user) {
      return res.status(404).json({message: "Cannot find user!"})
    }
  }
    catch (err) {
      return res.status(500).json({message: err.message})
    }
    res.user = user
    next()
  }


  // Randomly generates an API key
 function generateAPIKey() {
    const apiKeyLength = 23; // You can adjust the length as needed
    const apiKey = crypto.randomBytes(apiKeyLength).toString('hex');
    return apiKey;
  }

  function convertToXML(data) {
    const builder = new xml2js.Builder({ rootName: 'GetUsersResponse', headless: false })
    const xml = builder.buildObject(data)
    console.log(xml)
    return xml
  }
  function convertUserXML(data) {
    console.log(data)
    id = data._id.toString()
    const builder = new xml2js.Builder({ rootName: 'GetUserResponse', headless: false })
    const xml = builder.buildObject(data)

    return xml
  }

  function accessKeytoXML(data) {
    id = data._id.toString()
    const builder = new xml2js.Builder({rootName: 'AccessKey', headless: true})
    const xml = builder.buildObject(data.accessKey)
    return xml
  }

  module.exports = router
