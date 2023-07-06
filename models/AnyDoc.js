const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnyDoc = new Schema({
    idPerson : { type: Schema.Types.ObjectId, ref: 'Person' },
    caseN: [{ type: Schema.Types.ObjectId, ref: 'Person' }],
    type: String, // ПКО, Договор
    description: String,
    date: Date,
    number: Number,
    sum: Number,
    sumLetters: String,
    // all beyond is AnyDocument-specific
    docProps: {
          pko: {
            lastNameGenitive: String,
            firstNameGenitive: String,
            middleNameGenitive: String,
            reason: String,
            attachment: String,
            organization: String,
            mainAccountant: String,
            cashier: String
          },
          agreement: {
            text: String
          }
    },
} ,
{timestamps: true}); 

module.exports = mongoose.model("AnyDoc", AnyDoc)

/* 
const mongoose = require('mongoose');
const { Schema } = mongoose;

const personSchema = Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  age: Number,
  stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }]
});

const storySchema = Schema({
  author: { type: Schema.Types.ObjectId, ref: 'Person' },
  title: String,
  fans: [{ type: Schema.Types.ObjectId, ref: 'Person' }]
});

const Story = mongoose.model('Story', storySchema);
const Person = mongoose.model('Person', personSchema);
 */