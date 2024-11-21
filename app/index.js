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
    res.render('home', { user: req.user, title: 'SDN Desakolot - Pendidikan dan Kegiatan Pramuka untuk Anak-anak', layout: 'index', data, landing: landing[0], breadcrumb, isRoot: true });
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
    const doc = await Doc.find().sort({ createdAt: -1 }).limit(4);
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

router.get('/error', (req, res) => {
  const returnTo = req.session.returnTo || '/'; // Jika tidak ada, kembali ke beranda
  // Jangan hapus session returnTo di sini, agar tetap ada setelah refresh
  res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
            <title>Terjadi Kesalahan</title>
        </head>
        <body>
            <div class="container d-flex justify-content-center align-items-center vh-100">
                <div class="text-center d-block">
                    <h6 class="bg-dark p-2 text-white fw-bold">SDN DESAKOLOT</h6>
                    <p class="lead">Maaf, terjadi kesalahan saat memproses permintaan Anda.</p>
                    <div><a href="/" class=" mb-1">Kembali ke Beranda</a> </div>
                    <div>
                    <a href="${returnTo}" class=" mb-1">Kembali ke Halaman Sebelumnya</a>
                    </div>
                    <div>
                    <a onclick="window.location.reload();" class="">Refresh Halaman</a>
                    </div>
                </div>
            </div>
            <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.0.7/dist/umd/popper.min.js"></script>
            <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
        </body>
        </html>
    `);
});
module.exports = router;
