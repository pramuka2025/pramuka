// models/LandingPage.js
const mongoose = require('mongoose');

const landingPageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  about: { type: String, required: true },
  description: { type: String, required: true },
  heroSection: {
    image: {
      url: { type: String, required: true },
      alt: { type: String, required: true },
    },
    ctaButton: {
      description: { type: String },
      text: { type: String },
      link: { type: String },
    },
  },
  socialMedia: {
    facebook: { link: { type: String } },
    instagram: { link: { type: String } },
  },
  footer: {
    contact: {
      email: { type: String },
      phone: { type: String },
      address: { type: String },
    },
  },
});

const LandingPage = mongoose.model('LandingPage', landingPageSchema);

module.exports = LandingPage;
