const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Client = new Schema({
  lastName: String,
  firstName: String,
  middleName: String,
//   birth: Date, 
  gender: String
});

module.exports = mongoose.model("Client", Client);
