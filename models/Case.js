const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Case = new Schema({
    idPerson : { type: Schema.Types.ObjectId, ref: 'Person' },
    caseN: String,
    caseDate: Date,
    comment: String,
} ,
{timestamps: true}); 

module.exports = mongoose.model("Case", Case)