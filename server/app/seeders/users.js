/* mySeedScript.js */

// require the necessary libraries
const { faker } = require('@faker-js/faker');
const MongoClient = require("mongodb").MongoClient;
let dotenv = require('dotenv').config({path: '../.env'})
const crypto = require('crypto')
// function randomIntFromInterval(min, max) { // min and max included
//     return Math.floor(Math.random() * (max - min + 1) + min);
// }

async function seedDB() {
    // Connection URL
    const uri = process.env.uri;

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        // useUnifiedTopology: true,
    });

    try {
        await client.startSession();
        console.log("Connected correctly to server");

        const collection = client.db("db").collection("users");

        // The drop() command destroys all data from a collection.
        // Make sure you run it against proper database and collection.
        collection.drop();

        // make a bunch of time series data
        let timeSeriesData = [];

        for (let i = 0; i < 5000; i++) {
            const userName = faker.person.firstName() ;
            const password = faker.word.noun();
            let newUser = {
                userName: userName,
               password: password,
                accessKey: generateAPIKey(),
                secretKey: generateAPIKey()
            };

            timeSeriesData.push(newUser);
        }
        collection.insertMany(timeSeriesData);

        console.log("Database seeded! :)");
        client.close();
        return
    } catch (err) {
        console.log(err.stack);
    }
}
function generateAPIKey() {
    const apiKeyLength = 23; // You can adjust the length as needed
    const apiKey = crypto.randomBytes(apiKeyLength).toString('hex');
    return apiKey;
  }
seedDB();
