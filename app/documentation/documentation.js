// routes/features.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Untuk menghapus file
const Doc = require('./documentationSchema');
const LandingPage = require('../landingpage/landingSchema');
const { auth } = require('../auth');

const router = express.Router();

// Setup storage untuk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images'); // Folder untuk menyimpan gambar
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Menyimpan dengan nama unik
  },
});

const upload = multer({ storage: storage });

router.get('/docadd', auth, async (req, res) => {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Galery Foto', url: '/galery' },
    { name: 'Add', url: '/docadd' },
  ];
  const landing = await LandingPage.find();
  res.render('doc/docAdd', { user: req.user, breadcrumb, isRoot: false, message: null, title: 'Create Documentation', layout: 'index', landing: landing[0] });
});

// Route untuk menambah Doc
router.post('/add', auth, upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Galery Foto', url: '/galery' },
    { name: 'Add', url: '/docadd' },
  ];
  const imageUrl = `${process.env.BASE_URL}/${path.join('images', req.file.filename)}`; // Mendapatkan path gambar

  const newDoc = new Doc({
    title,
    description,
    imageUrl,
  });

  const landing = await LandingPage.find();
  try {
    await newDoc.save();
    res.render('doc/docAdd', {
      message: {
        status: 'success',
        pesan: `documentation ${title} berhasil ditambahkan!`,
      },
      user: req.user,
      breadcrumb,
      isRoot: false,
      title: 'Create Documentation',
      layout: 'index',
      landing: landing[0],
    });
  } catch (error) {
    res.render('doc/docAdd', {
      message: {
        status: 'error',
        pesan: `documentation ${title} gagal ditambahkan!`,
        err: error,
      },
      user: req.user,
      breadcrumb,
      isRoot: false,
      title: 'Create Documentation',
      layout: 'index',
      landing: landing[0],
      error,
    });
  }
});

router.get('/docedit/:id', auth, async (req, res) => {
  const { id } = req.params;
  const landing = await LandingPage.find();
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Galery Foto', url: '/galery' },
    { name: 'Edit', url: `/doc/docedit/${id}` },
  ];
  try {
    const doc = await Doc.findById(id);
    if (!doc) {
      return res.status(404).render('doc/docEdit', {
        message: {
          status: 'error',
          pesan: 'Dokumen tidak ditemukan',
        },
      });
    }

    // Mengirimkan data dokumen ke halaman edit
    res.render('doc/docEdit', { user: req.user, doc, landing: landing[0], message: null, breadcrumb, isRoot: false, title: 'Edit Documentation', layout: 'index' });
  } catch (error) {
    console.error(error);
    res.status(500).render('doc/docEdit', {
      message: {
        status: 'error',
        pesan: 'Terjadi kesalahan saat mengambil dokumen',
        err: error,
      },
      user: req.user,
      breadcrumb,
      isRoot: false,
      title: 'Edit Documentation',
      layout: 'index',
      landing: landing[0],
    });
  }
});

router.post('/docedit/:id', auth, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Galery Foto', url: '/galery' },
    { name: 'Edit', url: `/doc/docedit/${id}` },
  ];

  const landing = await LandingPage.find();
  try {
    const doc = await Doc.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Documentation tidak ditemukan' });
    }

    // Jika ada gambar baru, hapus gambar lama
    if (req.file) {
      // Menghapus bagian URL dari imageUrl menggunakan BASE_URL dari env
      const oldImagePath = doc.imageUrl.replace(process.env.BASE_URL + '/', '');
      const fullOldImagePath = path.join(__dirname, '../../', oldImagePath);
      console.log('Attempting to delete old image at:', fullOldImagePath);

      if (fs.existsSync(fullOldImagePath)) {
        fs.unlink(fullOldImagePath, (err) => {
          if (err) {
            console.error('Gagal menghapus gambar lama:', err);
          } else {
            console.log('Gambar lama berhasil dihapus');
          }
        });
      } else {
        console.log('Gambar lama tidak ditemukan:', fullOldImagePath);
      }

      // Update imageUrl dengan gambar baru
      doc.imageUrl = `${process.env.BASE_URL}/images/${req.file.filename}`; // Pastikan ini adalah path relatif
    }

    // Update field lainnya
    doc.title = title;
    doc.description = description;

    await doc.save(); // Simpan perubahan pada instance dokumen
    res.render('doc/docEdit', {
      doc,
      message: {
        status: 'success',
        pesan: `Documentation ${title} berhasil diperbarui!`,
      },
      user: req.user,
      breadcrumb,
      isRoot: false,
      title: 'Edit Documentation',
      layout: 'index',
      landing: landing[0],
    });
  } catch (error) {
    console.error(error);
    res.render('doc/docEdit', {
      message: {
        status: 'error',
        pesan: `Documentation ${title} gagal diperbarui!`,
      },
      user: req.user,
      breadcrumb,
      isRoot: false,
      title: 'Edit Documentation',
      layout: 'index',
      landing: landing[0],
      error,
    });
  }
});

// Route untuk menghapus documentation
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const documents = await Doc.findById(id);
    if (!documents) {
      return res.status(404).json({ message: 'Fitur tidak ditemukan' });
    }

    // Hapus gambar dari server
    const oldImagePath = documents.imageUrl.replace(process.env.BASE_URL + '/', '');
    const imagePath = path.join(__dirname, '../../', oldImagePath);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Gagal menghapus gambar:', err);
      }
    });

    // Panggil findByIdAndDelete pada model, bukan pada dokumen
    await Doc.findByIdAndDelete(id);
    res.json({ message: 'Dokumentasi berhasil dihapus!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Gagal menghapus dokumentasi', error });
  }
});

module.exports = router;
