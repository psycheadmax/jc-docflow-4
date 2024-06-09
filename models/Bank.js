const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Bank = new Schema({
  synName: [String], // synonyms array
  bik: String,
  fullName: String,
  shortName: String,
  index: String,
  city: String,
  addressUlDom: String,
  inn: String,
  ogrn: String,
  comment: String
} ,
{timestamps: true}); 
        
module.exports = mongoose.model("Bank", Bank)