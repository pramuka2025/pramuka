// routes/features.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Untuk menghapus file
const Feature = require('./featuresModel');
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

router.get('/fituradd', auth, async (req, res) => {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Artikel & info', url: '/allinfo' },
    { name: 'Add', url: '/fitures/fituradd' },
  ];
  const landing = await LandingPage.find();
  res.render('fitures/fiturAdd', { user: req.user, landing: landing[0], layout: 'index', title: 'Info & Article', breadcrumb, isRoot: false, message: null });
});
// Route untuk menambah fitur
router.post('/add', auth, upload.single('image'), async (req, res) => {
  const { title, description, content } = req.body;

  // Cek apakah file diupload
  if (!req.file) {
    return res.status(400).json({ message: 'File tidak diupload' });
  }

  const imageUrl = `${process.env.BASE_URL}/${req.file.path}`; // Mendapatkan path gambar

  const newFeature = new Feature({
    title,
    description,
    content,
    imageUrl,
  });

  console.log(newFeature);

  try {
    await newFeature.save();
    res.json({
      // Pastikan untuk menggunakan nama view yang valid
      message: {
        status: 'success',
        pesan: `Fitur ${title} berhasil ditambahkan!`,
      },

      feature: newFeature,
    });
  } catch (error) {
    console.error('Error saving feature:', error); // Log error untuk debugging
    res.json({
      // Pastikan untuk menggunakan nama view yang valid
      message: {
        status: 'error',
        pesan: 'Fitur gagal ditambahkan',
      },
      error,
    });
  }
});
router.get('/fituredit/:id', auth, async (req, res) => {
  const { id } = req.params; // Mengambil ID dari URL params
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Artikel & info', url: '/allinfo' },
    { name: 'Edit', url: `/fitures/fituredit/${id}` },
  ];
  try {
    const feature = await Feature.findById(id); // Mencari fitur berdasarkan ID
    if (!feature) {
      return res.status(404).json({ message: 'Fitur tidak ditemukan' });
    }
    const landing = await LandingPage.find();
    res.render('fitures/fiturEdit', {
      // Pastikan untuk menggunakan nama view yang valid
      message: {
        status: 'success',
        pesan: `Fitur berhasil diedit!`,
      },
      user: req.user,
      feature,
      landing: landing[0],
      layout: 'index',
      breadcrumb,
      isRoot: false,
      title: 'Artic Edit',
    }); // Mengembalikan data fitur dalam format JSON
  } catch (error) {
    console.error('Error fetching feature:', error);
    res.json({
      // Pastikan untuk menggunakan nama view yang valid
      message: {
        status: 'error',
        pesan: `Fitur gagal diedit!`,
      },
      error,
    });
  }
});

router.post('/edit/:id', auth, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, description, content } = req.body;

  try {
    const feature = await Feature.findById(id);
    if (!feature) {
      return res.status(404).json({ message: 'Fitur tidak ditemukan' });
    }

    // Jika ada gambar baru, hapus gambar lama
    if (req.file) {
      // Menghapus bagian URL dari imageUrl menggunakan BASE_URL dari env
      const oldImagePath = feature.imageUrl.replace(process.env.BASE_URL + '/', '');
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
      feature.imageUrl = `${process.env.BASE_URL}/images/${req.file.filename}`; // Pastikan ini adalah path relatif
    }

    // Update field lainnya
    feature.title = title;
    feature.description = description;
    feature.content = content;

    await feature.save();
    res.json({
      // Pastikan untuk menggunakan nama view yang valid
      message: {
        status: 'success',
        pesan: `Fitur berhasil diedit!`,
      },
      feature,
    });
  } catch (error) {
    res.status(500).json({
      // Pastikan untuk menggunakan nama view yang valid
      message: {
        status: 'error',
        pesan: `Fitur gagal diedit!`,
      },
    });
  }
});

// Route untuk menghapus fitur
router.delete('/delete/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const feature = await Feature.findById(id);
    if (!feature) {
      return res.status(404).json({ message: 'Fitur tidak ditemukan' });
    }

    // Hapus gambar dari server
    const oldImagePath = feature.imageUrl.replace(process.env.BASE_URL + '/', '');
    const imagePath = path.join(__dirname, '../../', oldImagePath);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Gagal menghapus gambar:', err);
      }
    });

    await Feature.findByIdAndDelete(id);
    res.json({ message: 'Fitur berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus fitur', error });
  }
});

module.exports = router;
