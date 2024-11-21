var express = require('express');
var router = express.Router();

const LandingPage = require('./landingpage/landingSchema');
const Doc = require('./documentation/documentationSchema');
const Fiture = require('./fitures/featuresModel');
const Partisipans = require('./partisipans/partisipansSchema');
const Menu = require('./menu/menuSchema');
// const Akredetasi = require('./akredetasi/akredetasiSchema');
const Akredetasi = require('./akredetasipramuka/akredetasiPramukaSchema');
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
    const akredetasiList = await Akredetasi.find();
    const uniqueCategories = {};
    const categoryCounts = {};
    akredetasiList.forEach((akredetasi) => {
      const category = akredetasi.category;

      // Jika kategori belum ada, inisialisasi dengan akreditasi pertama
      if (!uniqueCategories[category]) {
        uniqueCategories[category] = akredetasi; // Simpan akredetasi pertama untuk kategori ini
        categoryCounts[category] = 0; // Inisialisasi jumlah kategori
      }

      // Tambahkan 1 untuk setiap akreditasi yang ditemukan di kategori ini
      categoryCounts[category] += 1;
    });

    // Mengubah objek menjadi array
    const filteredAkredetasi = Object.values(uniqueCategories);
    // Mengubah objek categoryCounts menjadi array
    const categoryCountsArray = Object.keys(categoryCounts).map((category) => ({
      category,
      count: categoryCounts[category],
    }));

    const data = {
      doc: doc || [], // Jika doc tidak ada, gunakan array kosong
      menu: menu || [], // Jika menu tidak ada, gunakan array kosong
      fiture: fiture || [], // Jika fiture tidak ada, gunakan array kosong
      partisipans: partisipans || [], // Jika partisipans tidak ada, gunakan array kosong
      akredetasi: filteredAkredetasi || [], // Jika akredetasi tidak
      akredetasi: filteredAkredetasi || [], // Jika akredetasi tidak
      categoryCounts: categoryCountsArray || [], // Jika categoryCounts tidak ada, gunakan array kosong
    };
    res.render('home', { user: req.user, title: 'Pramuka SDN Desakolot - Pendidikan dan Kegiatan Pramuka untuk Anak-anak', layout: 'index', data, landing: landing[0], breadcrumb, isRoot: true });
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
  if (!req.user.token || req.user.token === null) {
    res.redirect('/');
  }
  try {
    const landing = await LandingPage.find();

    const doc = await Doc.find();
    const fiture = await Fiture.find();
    const partisipans = await Partisipans.find();
    const menu = await Menu.find();

    const akredetasi = await Akredetasi.find();
    const data = {
      doc: doc,
      menu: menu,
      fiture: fiture,
      partisipans,
      akredetasi: akredetasi,
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
    res.render('fitures/info', { user: req.user, title: `${fiture.title}`, fiture, landing: landing[0], breadcrumb, isRoot: false, layout: 'index' });
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
    res.render('fitures/allInfo', { user: req.user, title: 'Informasi Pramuka SDN Desakolot - Berita, Kegiatan, dan Pengumuman Terbaru', fiture, landing: landing[0], breadcrumb, isRoot: false, layout: 'index' });
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
    res.render('doc/allGalery', { user: req.user, title: 'Galeri Kegiatan Pramuka SDN Desakolot - Dokumentasi dan Momen Berharga', doc, landing: landing[0], breadcrumb, isRoot: false, layout: 'index' });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error,
    });
  }
});

// router.get('/allakredetasi', authPublic, async function (req, res, next) {
//   const breadcrumb = [
//     { name: 'Home', url: '/' },
//     { name: 'All akredetasi', url: '/allakredetasi' },
//   ];
//   try {
//     const landing = await LandingPage.find();
//     const akredetasi = await Akredetasi.find();
//     res.render('akredetasiView/akredetasiAll', { user: req.user, title: 'Akredetasi', akredetasi, landing: landing[0], breadcrumb, isRoot: false, layout: 'index' });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Internal Server Error',
//       error,
//     });
//   }
// });

router.get('/about', authPublic, async function (req, res, next) {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
  ];
  try {
    const landing = await LandingPage.find();
    res.render('about', { user: req.user, title: 'Tentang SDN Desakolot Pramuka - Misi, Visi, dan Kegiatan Pramuka', landing: landing[0], breadcrumb, isRoot: false, layout: 'index' });
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
