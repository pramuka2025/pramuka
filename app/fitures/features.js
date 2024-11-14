// routes/features.js
const express = require('express');
const multer = require('multer');
const path = require('path');

const { v4: uuidv4 } = require('uuid');
const fs = require('fs'); // Untuk menghapus file
const Feature = require('./featuresModel');
const LandingPage = require('../landingpage/landingSchema');
const { auth } = require('../auth');
const { ref, storage, getDownloadURL, uploadBytes, deleteObject } = require('../../firebase');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/add', auth, async (req, res) => {
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
  const file = req.file;

  // Cek apakah file diupload
  if (!file) {
    return res.status(400).json({ message: 'File tidak diupload' });
  }

  let imageUrl = '';
  const imageRef = ref(storage, `images/${uuidv4()}-${file.originalname}`);
  const metadata = {
    contentType: file.mimetype,
    customMetadata: {
      description: `${title}`,
    },
    contentDisposition: 'inline; filename="' + file.originalname + '"',
    cacheControl: 'public, max-age=31536000',
  };

  try {
    await uploadBytes(imageRef, file.buffer, metadata);
    imageUrl = await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ message: 'Gagal mengupload gambar', error });
  }

  const newFeature = new Feature({
    title,
    description,
    content,
    imageUrl: imageUrl, // Perbaiki menjadi imageUrl
  });

  console.log(newFeature);

  try {
    await newFeature.save();
    res.json({
      message: {
        status: 'success',
        pesan: `Artikel/info ${title} berhasil ditambahkan!`,
      },
      feature: newFeature,
    });
  } catch (error) {
    console.error('Error saving feature:', error);
    res.status(500).json({
      message: {
        status: 'error',
        pesan: 'Artikel/info gagal ditambahkan',
      },
      error,
    });
  }
});
router.get('/edit/:id', auth, async (req, res) => {
  const { id } = req.params; // Mengambil ID dari URL params
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Artikel & info', url: '/allinfo' },
    { name: 'Edit', url: `/fitures/fituredit/${id}` },
  ];
  try {
    const feature = await Feature.findById(id); // Mencari fitur berdasarkan ID
    if (!feature) {
      return res.status(404).json({ message: 'Artikel/info tidak ditemukan' });
    }
    const landing = await LandingPage.find();
    res.render('fitures/fiturEdit', {
      // Pastikan untuk menggunakan nama view yang valid
      message: {
        status: 'success',
        pesan: `Artikel/info berhasil diedit!`,
      },
      user: req.user,
      feature,
      landing: landing[0],
      layout: 'index',
      breadcrumb,
      isRoot: false,
      title: 'Artikel/info Edit',
    }); // Mengembalikan data fitur dalam format JSON
  } catch (error) {
    console.error('Error fetching feature:', error);
    res.json({
      // Pastikan untuk menggunakan nama view yang valid
      message: {
        status: 'error',
        pesan: `Artikel/info gagal diedit!`,
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
      return res.status(404).json({ message: 'Artikel/info tidak ditemukan' });
    }

    const currentImage = feature.imageUrl;

    // Fungsi untuk mengupload gambar baru
    const uploadImage = async (file) => {
      if (!file) return null;

      const imageRef = ref(storage, `images/${uuidv4()}-${file.originalname}`);
      const metadata = {
        contentType: file.mimetype,
        customMetadata: {
          description: title, // Menggunakan title yang baru
        },
        contentDisposition: 'inline; filename="' + file.originalname + '"',
        cacheControl: 'public, max-age=31536000',
      };
      await uploadBytes(imageRef, file.buffer, metadata);
      return await getDownloadURL(imageRef);
    };

    // Fungsi untuk menghapus gambar lama
    const deleteOldImage = async (imageUrl) => {
      if (imageUrl) {
        const oldImageRef = ref(storage, imageUrl); // Pastikan ini adalah referensi yang benar
        await deleteObject(oldImageRef);
      }
    };

    // Jika ada gambar baru, hapus gambar lama dan upload gambar baru
    if (req.file) {
      await deleteOldImage(currentImage);
      feature.imageUrl = await uploadImage(req.file);
    }

    // Update field lainnya
    feature.title = title;
    feature.description = description;
    feature.content = content;

    await feature.save();
    res.json({
      message: {
        status: 'success',
        pesan: `Artikel/info berhasil diedit!`,
      },
      feature,
    });
  } catch (error) {
    console.error('Error editing feature:', error); // Log error untuk debugging
    res.status(500).json({
      message: {
        status: 'error',
        pesan: `Artikel/info gagal diedit!`,
      },
      error: error.message, // Menyertakan pesan error untuk informasi lebih lanjut
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

    // // Hapus gambar dari server
    // const oldImagePath = feature.imageUrl.replace(process.env.BASE_URL + '/', '');
    // const imagePath = path.join(__dirname, '../../', oldImagePath);
    // fs.unlink(imagePath, (err) => {
    //   if (err) {
    //     console.error('Gagal menghapus gambar:', err);
    //   }
    // });

    const currentImage = feature.imageUrl;

    // Hapus file lama jika ada
    const deleteOldImage = async (imageUrl) => {
      if (imageUrl) {
        const oldImageRef = ref(storage, imageUrl); // Pastikan ini adalah referensi yang benar
        await deleteObject(oldImageRef);
      }
    };

    await deleteOldImage(currentImage);

    await Feature.findByIdAndDelete(id);
    res.json({ message: 'Fitur berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus fitur', error });
  }
});

module.exports = router;
