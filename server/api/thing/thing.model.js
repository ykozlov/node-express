var mongoose = require('mongoose');

var ThingSchema = new mongoose.Schema({
    name: String
});

export default mongoose.model('Thing', ThingSchema);

