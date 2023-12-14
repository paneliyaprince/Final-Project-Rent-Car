const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const cors = require('cors');
const multer = require('multer');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');


connectDB();
app.use(cors({ origin: 'http://localhost:5000', credentials: true }));

//use express session to maintain session data
app.use(session({
    secret: 'cmpe202_Rent_A_Car',
    resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, // Force to save uninitialized session to db. A session is uninitialized when it is new but not modified.
    duration: 60 * 60 * 1000,    // Overall duration of Session : 30 minutes : 1800 seconds
    activeDuration: 5 * 60 * 1000
}));

app.use(cookieParser());
// app.use(bodyParser.urlencoded({
//     extended: true
//   }));
app.use(bodyParser.json());

//Allow Access Control
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, content-type");
    next();
});


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/')
//     },
//     filename: function (req, file, callback) {
//         callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//     }
// });

// const upload = multer({
//     storage: storage,
// })

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));




const usersRoute = require('./routes/users');
const vehiclesRoute = require('./routes/vehicles');
const rentalLocationsRoute = require('./routes/rentalLocations');
const reservationsRoute = require('./routes/reservations');
const loginRouter=require('./routes/loginRouter');
const vehicleTypeRoute = require('./routes/vehicleTypeRouter')

app.use(bodyParser.json());

app.use('/users', usersRoute)
app.use('/vehicles', vehiclesRoute)
app.use('/rentalLocations', rentalLocationsRoute)
app.use('/reservations', reservationsRoute)
app.use('/login',loginRouter)
app.use('/vehicleType',vehicleTypeRoute)


app.get('/',(req,res) => {
    res.send('Home');
});

mongoose.set('useCreateIndex', true);


app.listen(3000);