const {Schema, model} = require("mongoose")
// const mongoose = require("mongoose")
// const Schema = mongoose.Schema

const Role = new Schema({
  value: {type: String, default: 'USER'},
})

module.exports = model("Role", Role);
