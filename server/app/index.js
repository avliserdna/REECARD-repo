
let dotenv = require('dotenv').config()

const express = require('express');
const app = express();
// const aws = require('aws-sdk');
// const bodyParser = require('body-parser');

// Use bodyParser middleware to parse JSON requests
// app.use(bodyParser.json());

const mongoose = require('mongoose')

const db = mongoose.connection


const uri = process.env.uri
mongoose.connect(uri, {useNewUrlParser:true})
db.on('error', (error) => console.error(error));
db.once('open', () => console.log("Server is on."))
app.use(express.json())

// Buckets
const bucketsRouter  = require('./routes/buckets')
app.use('/buckets', bucketsRouter)

// Files
const filesRouter = require('./routes/files')
app.use('/files', filesRouter)
const port = process.env.PORT; // Change this value with env later on

// Users
const userRouter = require('./routes/users')
app.use('/users', userRouter)

app.listen(port, () => console.log(`Server is listening on port ${port}`))
