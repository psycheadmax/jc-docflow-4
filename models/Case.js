const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Case = new Schema({
    idPerson : { type: Schema.Types.ObjectId, ref: 'Person' },
    caseTitle: String,
    // caseN: String,
    caseDate: Date,
    caseCategory: String,
    caseReceivedDocs: [
        {
            title: String,
            have: Boolean
        }
    ], // [Title of the doc, Have] TODO find where to enter received docs
    caseFlow: [
        {
            phase: String,
            date: Date,
            comment: String
        }
    ], // [Phase, Date, Comment] TODO
    caseReminder: [
        {
            title: String, 
            date: Date, 
            active: Boolean, 
            comment: String
        }
    ], // TODO [Title, Date, Active, Comment]
    comment: String,
} ,
{timestamps: true}); 

module.exports = mongoose.model("Case", Case)