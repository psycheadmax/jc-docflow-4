const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Person = new Schema({
  lastName: String,
  firstName: String,
  middleName: String,
  gender: String,
  innNumber: String,
  snilsNumber: String,
  birthDate: Date, 
  birthPlace: String,
  passSerie: String,
  passNumber: String,
  passIssueDate: Date,
  passIssuePlace: String,
  passCode:String,
  addrRegCity: String,
  addrRegStreet: String,
  addrRegBuilding: String,
  addrRegAppt: String,
  addrFactCity: String,
  addrFactStreet: String,
  addrFactBuilding: String,
  addrFactAppt: String,
  phone1: String,
  phone2: String,
  phone3: String,
  phone4: String,
  comment: String
} ,
{timestamps: true});

module.exports = mongoose.model("Person", Person);
