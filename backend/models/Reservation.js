const mongoose = require('mongoose');
const User = require('./User')
const Vehicle = require('./Vehicle')

const Schema = mongoose.Schema
const reservationSchema = new Schema({
     
     user:{type: String, required: true },
     vehicle: {type: String,required: true },
     pickupLocation:{type:String,  required: true},
     returnLocation:{type: String, required: true},
     pickupTime:{ type: Number, required: true}, 
     returnTime:{ type: Number},
     status : {type : String},
     totalPrice : {type : Number, default : 0},
     expectedReturnTime:{ type: Number, required: true},
     returned:{ type: Boolean, required:true, default : false}
     
     
});

module.exports = mongoose.model('Reservation',reservationSchema);
