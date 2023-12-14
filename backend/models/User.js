const mongoose = require('mongoose');

const Schema = mongoose.Schema

const userSchema = new Schema({

    emailAddress: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name : {type : String},
    admin: {type:Boolean},
    manager : {type : Boolean},
    dlImage: { type: String },
    creditCardInfo: { type: Number},
    accountExpiry : {type : Date, default : () => new Date(+new Date() + 180*24*60*60*1000) }, //Add 6 Months
    residenceAddress:{ type: String},
    phoneNumber:{type: Number},
    isValidated : {type : Boolean},
    membershipFee : {type : Number, default : 50}
});

module.exports = mongoose.model('Users',userSchema);



 
