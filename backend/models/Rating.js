const mongoose = require('mongoose');
const Vehicle = require('./Vehicle');

const Schema = mongoose.Schema 
const ratingSchema =  new Schema({
     rating:{ type: Number, required: true},
     comment:{ type: String},
     timestamp : {type : Date, default : new Date()},
     vehicle:{type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
});

module.exports = mongoose.model('Rating',ratingSchema);
