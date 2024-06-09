const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Org = new Schema({
  shortName: String,
  fullName: String,
  innOrg: String,
  ogrnOrg: String,
  creationDateOrg: Date,
  addressOrg: [{
    descriptionOrg: String, // юридический, fuckтический etc
    indexOrg: String,
    subjectOrg: String,
    settlementOrg: String,
    cityOrg: String,
    streetOrg: String,
    buildingOrg: String,
    appartmentOrg: String,
  }],
    commentOrg: String
} ,
{timestamps: true}); 
        
module.exports = mongoose.model("Org", Org)