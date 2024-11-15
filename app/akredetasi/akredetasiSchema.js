const mongoose = require('mongoose');

const akredetasiSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  sub_akredetasi: [
    {
      title: { type: String, required: true },
      link: { type: String, required: true },
    },
  ],
});
module.exports = mongoose.model('Akredetasi', akredetasiSchema);
