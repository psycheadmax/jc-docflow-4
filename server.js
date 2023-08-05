// TODO later
// add require('express').Router() https://dev.to/albertofdzm/mongoose-mongodb-and-express-596
// add morgan logger
require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const path = require("path")

const dbURI = process.env['DB_URI']
const SERVER_PORT = process.env['SERVER_PORT']

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Import Model
const Person = require("./models/Person");
const Case = require("./models/Case");
const AnyDoc = require("./models/AnyDoc")

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
  
  // PERSONS =======================================
  // Get all of our persons
  //  NOT IN USE
  app.get("/api/persons/all", (req, res) => {
    Person.find({})
    .populate('cases')
    .then(persons => {
      res.json(persons);
    });
  });

  // Search persons
  // <CheckBeforeCreate /> <SearchAndResults />
app.post("/api/persons/search", (req, res) => {
  const data = {
    ...req.body
  }
  Person.find(data)
  .populate('cases')
  .then(persons => {
    res.json(persons);
  });
});

// Get One of Our persons
app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id.replace('id', '')
  Person.findOne({ _id: id })
  .populate('cases')
  .then(person => {
    res.json(person);
  });
});

// Create and Update person
app.post("/api/persons/write", (req, res) => {
  const data = {
    // id: req.body.id,
    ...req.body
  }
  Person.findOne({ _id: req.body._id }, (err, person) => { 
    if (person) {
      Person.findByIdAndUpdate(req.body._id, data, { upsert: false }).then(
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
  app.post("/api/persons/delete/:id", (req, res) => {
    const id = req.params.id.replace('id', '')
    Person.findByIdAndDelete(id).then(person => {
      res.json({ message: "Person was deleted!" });
    });
  });
// END OF PERSONS =======================================

// DOCS ================================================
// Give receipt MB DELETE?
app.get('/api/docs/receipt/html', function(req,res) {
  const pathToHTML = path.join(__dirname, '/client/docTemplates/receipt/receipt.html')
  console.log('pathToHTML:' + pathToHTML)
  res.sendFile(pathToHTML)
});

// Create and Update doc
app.post("/api/docs/write", (req, res) => {
  const data = {
    ...req.body,
    // id: req.body.id
  };
  AnyDoc.findOne({ _id: req.body._id}, (err, doc) => { 
    if (doc) {
      AnyDoc.findByIdAndUpdate(req.body._id, data, { upsert: false }).then( 
        updated => {
          res.json(updated);
        }
        );
      } else {
        AnyDoc.create(data).then(created => {
          res.json(created);
        });
      }
    });
  });

  // Get One of Docs
app.get("/api/docs/:id", (req, res) => {
  // console.log(`Get One of Docs. Doc: ${req.params.id}`)
  const id = req.params.id.replace('id', '')
  AnyDoc.findOne({ _id: id })
  .populate('cases')
  .then(doc => {
    res.json(doc);
  });
});
  
  // Delete selected DOC
  app.post("/api/docs/delete/:id", (req, res) => {
    const id = req.params.id.replace('id', '')
    AnyDoc.findByIdAndDelete(id).then(doc => {
      res.json({ message: "Document was deleted!" });
    });
  });

// Get docs on Docs page
app.get("/api/docs/all", (req, res) => {
  AnyDoc.find({}).then(docs => {
    res.json(docs);
  });
});

// Search docs
app.post("/api/docs/search", (req, res) => {
  const data = {
    ...req.body
  }
  AnyDoc.find(data)
  .populate("cases")
  .then((docs) => {
    res.json(docs);
  });
});
// END OF DOCS ================================================

async function serverStart() {
  try {
    mongoose.connect(
      dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}, //TODO MB remove useFindAndModify: false 
      () => console.log("Connected to MongoDB")
      );
      app.listen(SERVER_PORT, () => console.log(`Server is running on port ${SERVER_PORT}`));
  } catch (error) {
    console.log('Server error', error.message)
    process.exit(1)
  }
}

serverStart()