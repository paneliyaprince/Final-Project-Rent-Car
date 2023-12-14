const mongoose = require('mongoose');


const Schema = mongoose.Schema
const vehicleTypeSchema = new Schema({
    category: { type: String, required: true },
    hourlyRate: { type: Number },
    hour1: { type: Number },
    hour6: { type: Number },
    hour11: { type: Number },
    hour16: { type: Number },
    day1: { type: Number },
    day2: { type: Number },
    day3: { type: Number },
    lateFee : {type : Number}
    
});

module.exports = mongoose.model('VehicleType', vehicleTypeSchema);
