const mongoose = require('mongoose');
const Vehicle = require('./Vehicle')
const Address = require('./Address')

const Schema = mongoose.Schema 
const rentalLocationSchema =  new Schema({
     name:{ type: String, required: true},
     address:{ type: Schema.Types.ObjectId, ref : 'Address', required : true }, 
     capacity:{ type: Number, required: true},
     numOfVehicles:{ type: Number, required: true },
     // vehicles:[{ type: Schema.Types.ObjectId, ref: 'Vehicle'}]
});

module.exports = mongoose.model('RentalLocation',rentalLocationSchema);
