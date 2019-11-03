const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const URL = new Schema({
  url: String,
  shorten: String,
  date: { type: Date, default: Date.now }
},{collection:'ShortURL'});
const MyModel = mongoose.model('ShortURL', URL);

module.exports = MyModel;