const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DocTemplate = new Schema({
  title: String,
  type: String,
  description: String,
  content: String,
} ,
{timestamps: true}); 
        
module.exports = mongoose.model("DocTemplate", DocTemplate)