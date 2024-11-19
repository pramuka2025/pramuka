const mongoose = require('mongoose');

const akredetasiPramukaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  fileId: { type: String, required: true },
  category: { type: String, required: true },
});
module.exports = mongoose.model('Akre', akredetasiPramukaSchema);
