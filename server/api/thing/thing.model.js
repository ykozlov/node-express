var mongoose = require('mongoose');

var ThingSchema = new mongoose.Schema({
  name: String,
  info: String
});

export default mongoose.model('Thing', ThingSchema);

