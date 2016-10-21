'use strict';
/*eslint no-invalid-this:0*/
import crypto from 'crypto';
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    lowercase: true
  },
  role: {
    type: String,
    default: 'user'
  },
  password: String,
  provider: String,
  salt: String
});

/**
 * Virtuals
 */

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      name: this.name,
      role: this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      _id: this._id,
      role: this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('password')
  .validate(function(password) {
    return password.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    return this.constructor.findOne({email: value}).exec()
      .then(user => {
        if(user) {
          if(this.id === user.id) {
            return respond(true);
          }
          return respond(false);
        }
        return respond(true);
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    // Handle new/update passwords
    if(!this.isModified('password')) {
      return next();
    }

    if(!validatePresenceOf(this.password)) {
      return next(new Error('Invalid password'));
    }

    // Make salt with a callback
    this.makeSalt()
      .then(salt => {
        this.salt = salt;
        return this.encryptPassword(this.password);
      })
      .then(hashedPassword => {
        this.password = hashedPassword;
        return next();
      })
      .catch(next);
  });

/**
 * Methods
 */
UserSchema.methods = {
  authenticate(password) {
    return new Promise((resolve, reject) => {
      this.encryptPassword(password)
        .then(pwdGen => resolve(this.password == pwdGen))
        .catch(reject);
    });
  },

  makeSalt() {
    return new Promise((resolve, reject) => {
      var byteSize = 16;

      crypto.randomBytes(byteSize, (err, salt) => {
        if(err) {
          return reject(err);
        } else {
          return resolve(salt.toString('base64'));
        }
      });
    });
  },

  encryptPassword(password) {
    return new Promise((resolve, reject) => {
      if(!password || !this.salt) {
        return reject('Missing password or salt');
      }

      var defaultIterations = 10000,
        defaultKeyLength = 64,
        salt = new Buffer(this.salt, 'base64');

      crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, (err, key) => {
        if(err) {
          return reject(err);
        } else {
          return resolve(key.toString('base64'));
        }
      });
    });
  }
};

export default mongoose.model('User', UserSchema);
