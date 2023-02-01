// TODO later
// add require('express').Router() https://dev.to/albertofdzm/mongoose-mongodb-and-express-596
// add morgan logger
require('dotenv').config()
const dbURI = process.env['DB_URI']
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Import Model
const Person = require("./models/Person");

// Connect to MongoDB
mongoose.connect(
  dbURI, { useNewUrlParser: true, useUnifiedTopology: true},
  () => console.log("MongoDB is connected")
);


// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Get all of our persons
app.get("/api/persons", (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  });
});

// Get One of Our persons
app.get("/api/persons/:id", (req, res) => {
  Person.findOne({ _id: req.params.id }).then(person => {
    res.json(person);
  });
  console.log('server: get one of our persons scenario:')
  console.log(person)
  console.log(req.params.id)
});

// Create and Update person
app.post("/api/persons", (req, res) => {
  const data = {
    id: req.body.id,
    lastName: req.body.lastName,
    firstName: req.body.firstName,
    middleName: req.body.middleName,
    //   birth: Date, 
    // gender: req.body.gender
  };
  Person.findOne({ _id: req.body.id }, (err, person) => { 
    if (person) {
      Person.findByIdAndUpdate(req.body.id, data, { upsert: false }).then(
        updated => {
          res.json(updated);
        }
      );
    } else {
      Person.create(data).then(created => {
        res.json(created);
      });
    }
  });
});

// Delete selected person
app.post("/api/persons/:id", (req, res) => {
  Person.findByIdAndDelete(req.params.id).then(person => {
    res.json({ message: "Person was deleted!" });
  });
});


app.listen(3333, () => console.log("Server is running on port 3333"));
