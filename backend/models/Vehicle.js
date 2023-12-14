const mongoose = require('mongoose');


const Schema = mongoose.Schema
const vehicleSchema = new Schema({
     carname : { type: String, required: true},
     type: { type: String },
     make: { type: String, required: true},
     modelYear: { type: Number, required: true},
     currentMileage: { type: Number, required: true},
     condition: { type: String, required: true},
     timeLastServiced:{ type: Date},
     ratings : {type : String},
     rentalLocation :  {type : String},
     availability : {type: Boolean, required: true}
});

module.exports = mongoose.model('Vehicle',vehicleSchema);
