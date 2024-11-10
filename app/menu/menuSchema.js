const mongoose = require('mongoose');

const menusSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
});

module.exports = mongoose.model('Menu', menusSchema);
