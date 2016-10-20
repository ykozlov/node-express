'use strict';

import Thing from './thing.model.js';

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        return res.status(statusCode).send(err);
    };
}

export function index(req, res) {
    return Thing.find({})
        .exec()
        .then(things => {
            res.status(200).json(things);
        })
        .catch(handleError(res));
}

export function create(req, res) {
    var newThing = new Thing(req.body);
    newThing.save()
        .then(function (user) {
            res.json(user);
        })
        .catch(handleError(res));
}
