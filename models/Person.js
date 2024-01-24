const mongoose = require("mongoose")
const Schema = mongoose.Schema

// const Person = new Schema({
//   lastName: String,
//   firstName: String,
//   middleName: String,
//   gender: String,
//   innNumber: String,
//   snilsNumber: String,
//   birth: { // refactor to birthDate, birthPlace
//     date: Date,
//     place: String
//   },
//   passport: {// refactor to passportSerie, passportNumber, passportDate, passportPlace, passportCode
//     serie: String,
//     number: String,
//     date: Date,
//     place: String,
//     code: String,
//   },
//   address: [{
//     description: String, // регистрации, фактический, спорный
//     city: String,
//     street: String,
//     building: String,
//     appartment: String,
//   }],
//   phone: [{
//     description: String, // основной, сотовый, дополнительный, рабочий...
//     number: String
//   }], 
//   comment: String,
//   cases: [{ type: Schema.Types.ObjectId, ref: 'Case' }]
// } ,
// {timestamps: true});

const Person = new Schema({
  lastName: String,
  firstName: String,
  middleName: String,
  gender: String,
  innNumber: String,
  snilsNumber: String,
  birthDate: String,
  birthPlace: String,
  passportSerie: String,
  passportNumber: String,
  passportDate: Date,
  passportPlace: String,
  passportCode: String,
  address: [{
    description: String, // регистрации, проживания, почтовый etc
    index: String,
    subject: String,
    settlement: String,
    city: String,
    street: String,
    building: String,
    appartment: String,
  }],
  phone: [{
    description: String, // основной, дополнительный, рабочий etc
    number: String
  }], 
  comment: String,
  email: String,
  cases: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Case' 
  }]
} ,
{timestamps: true});

module.exports = mongoose.model("Person", Person);
