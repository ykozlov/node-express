'use strict';

import User from './user.model';
import {signToken} from '../../auth/auth.service';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({}, '-salt -password')
    .then(users => res.status(200).json(users))
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res) {
  var newUser = new User(req.body);
  newUser.save()
    .then(user => {
      var token = signToken(user._id, user.role);
      res.status(201).json({token});
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;
  User.findById(userId)
    .then(user => {
      if(!user) {
        return res.status(404).end();
      }
      return res.json(user.profile);
    })
    .catch(next);
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  var userId = req.user._id,
    oldPass = String(req.body.oldPassword),
    newPass = String(req.body.newPassword),
    user;

  User.findById(userId)
    .then(userEntity => {
      user = userEntity;
      if(!user) {
        return Promise.reject({
          message: 'This email is not registered.'
        });
      }

      return user.authenticate(oldPass);
    })
    .then(authenticated => {
      if(authenticated) {
        user.password = newPass;
        user.save()
          .then(() => res.status(204).end())
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    })
    .catch(handleError(res));
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;
  User.findById(userId)
    .select('-salt -password')
    .then(user => {
      // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }

      return res.json(user);
    })
    .catch(next);
}
