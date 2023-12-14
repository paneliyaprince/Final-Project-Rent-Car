
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const passport = require('passport');

const secret = 'ThisisCMPE202PROJECTAABM';
const User = require('../models/User');


function auth() {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret,
  };
  passport.use(
    new JwtStrategy(opts, (jwt_payload, callback) => {
      console.log('PAYLOAD', jwt_payload)
      const user_id = jwt_payload._id;
      User.findById(user_id,  (error, results) => {
        if (error) {
          return callback(err, false);
        }
        callback(null, {user : results});
      })
    }),
  );
}

exports.auth = auth;
exports.checkAuth = passport.authenticate('jwt', { session: false });
