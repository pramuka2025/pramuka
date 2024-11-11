var express = require('express');
var router = express.Router();

const LandingPage = require('./landingpage/landingSchema');
const Doc = require('./documentation/documentationSchema');
const Fiture = require('./fitures/featuresModel');
const Partisipans = require('./partisipans/partisipansSchema');
const Menu = require('./menu/menuSchema');
const { auth, authPublic } = require('./auth');

/* GET home page. */
router.get('/', authPublic, async function (req, res, next) {
  const breadcrumb = [{ name: 'Home', url: '/' }];
  try {
    const landingpage = await LandingPage.find();
    const landing = landingpage ? landingpage : null;
    const doc = await Doc.find();
    const fiture = await Fiture.find();
    const partisipans = await Partisipans.find();
    const menu = await Menu.find();
    const data = {
      doc: doc || [], // Jika doc tidak ada, gunakan array kosong
      menu: menu || [], // Jika menu tidak ada, gunakan array kosong
      fiture: fiture || [], // Jika fiture tidak ada, gunakan array kosong
      partisipans: partisipans || [], // Jika partisipans tidak ada, gunakan array kosong
    };
    res.render('home', { user: req.user, title: 'halaman home', layout: 'index', data, landing: landing[0], breadcrumb, isRoot: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error,
    });
  }
});
router.get('/dashboard', auth, async function (req, res, next) {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Dashboard', url: '/dashboard' },
  ];
  try {
    const landing = await LandingPage.find();
    const doc = await Doc.find();
    const fiture = await Fiture.find();
    const partisipans = await Partisipans.find();
    const menu = await Menu.find();
    const data = {
      doc: doc,
      menu: menu,
      fiture: fiture,
      partisipans,
    };
    res.render('dashboard', { user: req.user, title: 'Halaman Dashboard', data, landing: landing[0], breadcrumb, isRoot: false, layout: 'index' });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error,
    });
  }
});

router.get('/info/:id', authPublic, async function (req, res, next) {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Info dan artikel', url: '/allinfo' },
    { name: 'Detail', url: '/info' },
  ];
  try {
    const landing = await LandingPage.find();
    const fiture = await Fiture.findById(req.params.id);
    res.render('fitures/info', { user: req.user, title: 'info & artikel pramuka', fiture, landing: landing[0], breadcrumb, isRoot: false, layout: 'index' });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error,
    });
  }
});

router.get('/allinfo', authPublic, async function (req, res, next) {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Info dan artikel', url: '/allinfo' },
  ];
  try {
    const landing = await LandingPage.find();
    const fiture = await Fiture.find();
    res.render('fitures/allInfo', { user: req.user, title: 'info & artikel pramuka', fiture, landing: landing[0], breadcrumb, isRoot: false, layout: 'index' });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error,
    });
  }
});

router.get('/galery', authPublic, async function (req, res, next) {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Galery Foto', url: '/galery' },
  ];
  try {
    const landing = await LandingPage.find();
    const doc = await Doc.find();
    res.render('doc/allGalery', { user: req.user, title: 'Galery Foto Pramuka', doc, landing: landing[0], breadcrumb, isRoot: false, layout: 'index' });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error,
    });
  }
});

router.get('/about', authPublic, async function (req, res, next) {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
  ];
  try {
    const landing = await LandingPage.find();
    res.render('about', { user: req.user, title: 'Halaman About', landing: landing[0], breadcrumb, isRoot: false, layout: 'index' });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error,
    });
  }
});
module.exports = router;
