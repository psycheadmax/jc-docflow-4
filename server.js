// TODO later
// add require('express').Router() https://dev.to/albertofdzm/mongoose-mongodb-and-express-596
// add morgan logger
require('dotenv').config()
const dbURI = process.env['DB_URI']
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const path = require("path")

const PORT = 3333

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Import Model
const Person = require("./models/Person");
const Case = require("./models/Case");
const AnyDoc = require("./models/AnyDoc")

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

// PERSONS =======================================
// Get all of our persons
app.get("/api/persons", (req, res) => {
  Person.find({})
  .populate('cases')
  .then(persons => {
    res.json(persons);
  });
});

// Search persons
app.post("/api/search", (req, res) => {
  const data = {
    lastName: req.body.lastName,
    firstName: req.body.firstName,
    middleName: req.body.middleName,
  }
  Person.find(data)
  .populate('cases')
  .then(persons => {
    res.json(persons);
  });
});

// Get One of Our persons
app.get("/api/persons/:id", (req, res) => {
  Person.findOne({ _id: req.params.id })
  .populate('cases')
  .then(person => {
    res.json(person);
  });
});

// Create and Update person
app.post("/api/persons", (req, res) => {
  const data = {
    id: req.body.id,
    ...req.body
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
// END OF PERSONS =======================================

// DOCS ================================================
// Give receipt MB DELETE?
app.get('/api/docs/receipt/html', function(req,res) {
  const pathToHTML = path.join(__dirname, '/client/docTemplates/receipt/receipt.html')
  console.log('pathToHTML:' + pathToHTML)
  res.sendFile(pathToHTML)
});

// Create and Update receipt
app.post("/api/docs/receipt", (req, res) => {
  const data = {
    id: req.body.id,
    ...req.body
  };
  AnyDoc.findOne({ _id: req.body.id, docType: 'pko' }, (err, doc) => { 
    if (doc) {
      AnyDoc.findByIdAndUpdate(req.body.id, data, { upsert: false }).then(
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

// Delete selected PKO
app.post("/api/docs/receipt/:id", (req, res) => {
  AnyDoc.findByIdAndDelete(req.params.id).then(doc => {
    res.json({ message: "Receipt was deleted!" });
  });
});

// Get docs on Docs page
app.get("/api/docs", (req, res) => {
  AnyDoc.find({}).then(docs => {
    res.json(docs);
  });
});

// Search docs
app.post("/api/docs", (req, res) => {
  const data = {
    ...req.body
    // caseN: req.body,caseN,
    // type: req.body.type,
    // dateFrom: '',
    // dateTo: '',
  }
  AnyDoc.find(data)
		.populate("cases")
		.then((docs) => {
			res.json(docs);
		});
});
// END OF DOCS ================================================

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
