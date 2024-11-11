const express = require('express');
const router = express.Router();
const Partisipan = require('./partisipansSchema');
const { responseHandler } = require('../../middleware/auth');
const LandingPage = require('../landingpage/landingSchema');
const { auth } = require('../auth');
// Halaman untuk menambah partisipan
router.get('/addpartisipans', auth, async (req, res) => {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Add', url: '/partisipans/addpartisipans' },
  ];
  const landing = await LandingPage.find();
  res.render('partiViews/addPertisipans', { user: req.user, breadcrumb, isRoot: false, landing: landing[0], layout: 'index', title: 'Add Partisipans', message: null });
});

// Menyimpan partisipan
router.post('/add', auth, async (req, res) => {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Add', url: '/partisipans/add' },
  ];
  const landing = await LandingPage.find();
  try {
    console.log('ini dari req body', req.body);
    const { title, peserta } = req.body;

    const newPartisipan = new Partisipan({ title, peserta });
    await newPartisipan.save();
    res.render('partiViews/addPertisipans', { user: req.user, breadcrumb, isRoot: false, landing: landing[0], layout: 'index', title: 'Add Partisipans', message: `Partisipan ${title} berhasil ditambahkan!` });
  } catch (error) {
    responseHandler(res, null, error.message, 500);
  }
});

router.get('/edit/:id', auth, async (req, res) => {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Edit', url: `/partisipans/edit/${req.params.id}` },
  ];
  try {
    const partisipan = await Partisipan.findById(req.params.id);
    const landing = await LandingPage.find();
    if (!partisipan) {
      return responseHandler(res, null, 'Partisipan tidak ditemukan', 404);
    }
    res.render('partiViews/editPart', { user: req.user, breadcrumb, isRoot: false, partisipan, landing: landing[0], layout: 'index', title: 'Edit Partisipans', message: null });
  } catch (error) {
    responseHandler(res, null, error.message, 500);
  }
});

router.post('/e/:id', auth, async (req, res) => {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Edit', url: `/partisipans/e/${req.params.id}` },
  ];
  const landing = await LandingPage.find();
  try {
    const { title, peserta } = req.body;
    const pesertaArray = Array.isArray(peserta) ? peserta : [peserta]; // Pastikan peserta adalah array
    const partisipan = await Partisipan.findByIdAndUpdate(req.params.id, { title, peserta: pesertaArray });
    res.render('partiViews/editPart', { user: req.user, breadcrumb, isRoot: false, partisipan, landing: landing[0], layout: 'index', title: 'Add Partisipans', message: `Partisipan ${title} berhasil diperbaharui!` });
  } catch (error) {
    console.error(error); // Log error untuk debugging
    responseHandler(res, null, error.message, 500);
  }
});

// Menghapus partisipan
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const deletedPartisipan = await Partisipan.findByIdAndDelete(req.params.id);
    if (!deletedPartisipan) {
      return responseHandler(res, null, 'Partisipan tidak ditemukan', 404);
    }
    responseHandler(res, null, 'Partisipan berhasil dihapus');
  } catch (error) {
    responseHandler(res, null, error.message, 500);
  }
});

module.exports = router;
