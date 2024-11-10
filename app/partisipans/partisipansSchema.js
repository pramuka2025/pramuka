const mongoose = require('mongoose');

const partisipanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  peserta: { type: [String], required: true },
});

module.exports = mongoose.model('Partisipans', partisipanSchema);
