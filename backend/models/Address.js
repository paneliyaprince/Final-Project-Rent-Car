const mongoose = require('mongoose');
const Schema = mongoose.Schema 
const addressSchema =  new Schema({
     address : {type : String, required : true}, 
     zipcode : {type: String, required: true},
});

module.exports = mongoose.model('Address',addressSchema);
