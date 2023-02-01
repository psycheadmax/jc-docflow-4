const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Person = new Schema({
  lastName: String,
  firstName: String,
  middleName: String,
//   birth: Date, 
  gender: String
} ,
{timestamps: true});

module.exports = mongoose.model("Person", Person);
