// routes/features.js
const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs'); // Untuk menghapus file
const Doc = require('./documentationSchema');
const LandingPage = require('../landingpage/landingSchema');
const { auth } = require('../auth');
const { ref, storage, getDownloadURL, uploadBytes, deleteObject } = require('../../firebase');

const router = express.Router();

// Konfigurasi multer untuk menyimpan file
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'images'); // Folder untuk menyimpan gambar
//   },
//   filename: (req, file, cb) => {
//     // Menggunakan nama asli file dengan timestamp untuk menghindari duplikasi
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname)); // Menyimpan dengan nama unik
//   },
// });

// const upload = multer({ storage: storage });

const upload = multer({ storage: multer.memoryStorage() });

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
  const file = req.file;
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Galery Foto', url: '/galery' },
    { name: 'Add', url: '/docadd' },
  ];

  // const imageUrl = `${process.env.BASE_URL}/${path.join('images', req.file.filename)}`; // Mendapatkan path gambar

  let imageUrl = '';
  if (file) {
    const imageRef = ref(storage, `images/${uuidv4()}-${file.originalname}`);
    const metadata = {
      contentType: file.mimetype,
      customMetadata: {
        description: `${title}`,
      },
      contentDisposition: 'inline; filename="' + file.originalname + '"',
      cacheControl: 'public, max-age=31536000',
    };
    await uploadBytes(imageRef, file.buffer, metadata);
    imageUrl = await getDownloadURL(imageRef);
  }

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

  const file = req.file;

  try {
    const doc = await Doc.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Documentation tidak ditemukan' });
    }

    const currentImage = doc.imageUrl;

    // Fungsi untuk mengupload gambar
    const uploadImage = async (file) => {
      if (!file) return null;

      const imageRef = ref(storage, `images/${uuidv4()}-${file.originalname}`);
      const metadata = {
        contentType: file.mimetype,
        customMetadata: {
          description: title, // Menggunakan title yang baru
        },
        contentDisposition: `inline; filename="${file.originalname}"`,
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
    if (file) {
      await deleteOldImage(currentImage);
      doc.imageUrl = await uploadImage(file);
    }

    // Update field lainnya
    doc.title = title;
    doc.description = description;

    await doc.save(); // Simpan perubahan pada instance dokumen
    res.json({
      doc,
      message: {
        status: 'success',
        pesan: `Documentation ${title} berhasil diperbarui!`,
      },
    });
  } catch (error) {
    console.error('Error updating documentation:', error);
    res.status(500).json({
      message: {
        status: 'error',
        pesan: `Documentation ${title} gagal diperbarui!`,
      },
      error: error.message, // Menyertakan pesan error untuk informasi lebih lanjut
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

    const currentImage = documents.imageUrl;

    // Hapus file lama jika ada
    const deleteOldImage = async (imageUrl) => {
      if (imageUrl) {
        const oldImageRef = ref(storage, imageUrl); // Pastikan ini adalah referensi yang benar
        await deleteObject(oldImageRef);
      }
    };

    await deleteOldImage(currentImage);
    // Panggil findByIdAndDelete pada model, bukan pada dokumen
    await Doc.findByIdAndDelete(id);
    res.json({ message: 'Dokumentasi berhasil dihapus!' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Gagal menghapus dokumentasi', error });
  }
});

module.exports = router;
