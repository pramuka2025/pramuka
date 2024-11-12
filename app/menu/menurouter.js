const express = require('express');
const router = express.Router();
const Menu = require('./menuSchema');
const { responseHandler } = require('../../middleware/auth');
const LandingPage = require('../landingpage/landingSchema');
const { auth } = require('../auth');
// Halaman untuk menambah partisipan
router.get('/menuadd', auth, async (req, res) => {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Add', url: '/menu/menuadd' },
  ];
  const landing = await LandingPage.find();
  res.render('menu/menuAdd', { user: req.user, breadcrumb, isRoot: false, landing: landing[0], layout: 'index', title: 'Add Menu', message: null });
});

// Menyimpan partisipan
router.post('/add', auth, async (req, res) => {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Add', url: '/menu/add' },
  ];
  const landing = await LandingPage.find();
  try {
    console.log('ini dari req body', req.body);
    const { title, link } = req.body;

    const menu = new Menu({ title, link });
    await menu.save();
    res.render('menu/menuAdd', { user: req.user, breadcrumb, isRoot: false, landing: landing[0], layout: 'index', title: 'Add Menu', message: `Menu ${title} berhasil ditambahkan!` });
  } catch (error) {
    responseHandler(res, null, error.message, 500);
  }
});

router.get('/edit/:id', auth, async (req, res) => {
  const { id } = req.params;
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Edit', url: `/menu/edit/${req.params.id}` },
  ];
  try {
    const menu = await Menu.findById(id);
    const landing = await LandingPage.find();
    if (!menu) {
      return responseHandler(res, null, 'Menu tidak ditemukan', 404);
    }
    res.render('menu/menuEdit', { user: req.user, breadcrumb, isRoot: false, menu, landing: landing[0], layout: 'index', title: 'Edit Menu', message: null });
  } catch (error) {
    responseHandler(res, null, error.message, 500);
  }
});

router.post('/edit/:id', auth, async (req, res) => {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Edit', url: `/menu/e/${req.params.id}` },
  ];
  const landing = await LandingPage.find();
  try {
    const { title, link } = req.body;
    const menu = await Menu.findByIdAndUpdate(req.params.id, { title, link });
    res.render('menu/menuEdit', { user: req.user, breadcrumb, isRoot: false, menu, landing: landing[0], layout: 'index', title: 'Edit Menu', message: `Menu ${title} berhasil diperbaharui!` });
  } catch (error) {
    console.error(error); // Log error untuk debugging
    responseHandler(res, null, error.message, 500);
  }
});
// Menghapus partisipan
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) {
      return responseHandler(res, null, 'Menu tidak ditemukan', 404);
    }
    responseHandler(res, null, 'Menu berhasil dihapus');
  } catch (error) {
    responseHandler(res, null, error.message, 500);
  }
});

module.exports = router;
