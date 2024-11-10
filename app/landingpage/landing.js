const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const LandingPage = require('./landingSchema'); // Pastikan path ini sesuai dengan struktur folder Anda
const { auth } = require('../auth');
// Konfigurasi multer untuk menyimpan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images'); // Folder untuk menyimpan gambar
  },
  filename: (req, file, cb) => {
    // Menggunakan nama asli file dengan timestamp untuk menghindari duplikasi
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Menyimpan dengan nama unik
  },
});

const upload = multer({ storage: storage });

// Route untuk menampilkan halaman tambah landing page
router.get('/landingadd', auth, async (req, res) => {
  const landing = await LandingPage.find();

  res.render('landingPage/landingAdd', { user: req.user, message: null, title: 'Landing Page Create', layout: 'index', landing: landing[0] }); // Render halaman EJS untuk menambah landing page
});

// Create - Menambahkan Landing Page baru
router.post('/add', auth, upload.single('heroImage'), async (req, res) => {
  const { title, about, description, socialMedia, email, phone, address } = req.body;

  // Membuat URL path untuk gambar yang diupload
  const heroImageUrl = `${process.env.BASE_URL}/images/${req.file.filename}`;

  const landingPage = new LandingPage({
    title,
    about,
    heroSection: {
      image: {
        url: heroImageUrl,
        alt: req.body.heroImageAlt, // Mengambil teks alt dari form
      },
      ctaButton: {
        text: req.body.ctaButtonDescription,
        text: req.body.ctaButtonText,
        link: req.body.ctaButtonLink,
      },
    },
    socialMedia,
    footer: {
      contact: {
        email,
        phone,
        address,
      },
    },
  });

  try {
    const savedLandingPage = await landingPage.save();
    const landing = await LandingPage.find();
    res.render('landingPage/landingAdd', {
      savedLandingPage,
      message: {
        status: 'success',
        pesan: `Landing Page berhasil dibuat!`,
      },
      user: req.user,
      title: 'Landing Page Create',
      layout: 'index',
      landing: landing[0],
    }); // Mengembalikan data yang disimpan sebagai JSON
    // res.redirect('/landing'); // Mengarahkan ke halaman daftar landing pages
  } catch (error) {
    const landing = await LandingPage.find();
    res.render('landingPage/landingAdd', {
      message: {
        status: 'error',
        pesan: `Landing Page gagal dibuat! ${error}`,
      },
      user: req.user,
      title: 'Landing Page Create',
      layout: 'index',
      landing: landing[0],
    });
  }
});

// Update - Memperbarui Landing Page berdasarkan ID
router.post('/edit/:id', auth, upload.single('heroImage'), async (req, res) => {
  const { id } = req.params;
  const { title, about, description, socialMedia, email, phone, address } = req.body;

  try {
    const landing = await LandingPage.findById(id);
    if (!landing) {
      return res.status(404).json({ message: 'landingumentation tidak ditemukan' });
    }

    // Jika ada gambar baru, hapus gambar lama
    if (req.file) {
      // Menghapus bagian URL dari imageUrl menggunakan BASE_URL dari env
      const oldImagePath = landing.heroSection.image.url.replace(process.env.BASE_URL + '/', '');
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
      landing.heroSection.image.url = `${process.env.BASE_URL}/images/${req.file.filename}`; // Pastikan ini adalah path relatif
    }

    // Update field lainnya
    landing.title = title;
    landing.about = about;
    landing.description = description;
    landing.heroSection.image.alt = req.body.heroImageAlt;
    landing.heroSection.ctaButton.description = req.body.ctaButtonDescription;
    landing.heroSection.ctaButton.text = req.body.ctaButtonText;
    landing.heroSection.ctaButton.link = req.body.ctaButtonLink;
    landing.socialMedia = socialMedia;
    landing.footer.contact.email = email;
    landing.footer.contact.phone = phone;
    landing.footer.contact.address = address;

    await landing.save(); // Simpan perubahan pada instance dokumen
    res.render('landingPage/landingEdit', {
      landing,
      message: {
        status: 'success',
        pesan: `Landing Page berhasil diperbarui!`,
      },
      user: req.user,
      title: 'Landing Page Edit',
      layout: 'index',
    });
  } catch (error) {
    console.error(error); // Log kesalahan untuk debugging
    const landing = await LandingPage.find();
    res.render('landingPage/landingEdit', {
      message: {
        status: 'error',
        pesan: `Landing Page gagal diperbarui!`,
      },
      user: req.user,
      title: 'Landing Page Edit',
      layout: 'index',
      landing: landing[0],
      error,
    });
  }
});

// Delete - Menghapus Landing Page berdasarkan ID
router.delete('/delete/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const landing = await LandingPage.findById(id);
    if (!landing) {
      return res.status(404).json({ message: 'landing tidak ditemukan' });
    }

    // Hapus gambar dari server
    const oldImagePath = landing.heroSection.image.url.replace(process.env.BASE_URL + '/', '');
    const imagePath = path.join(__dirname, '../../', oldImagePath);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Gagal menghapus gambar:', err);
      }
    });

    await LandingPage.findByIdAndDelete(id);
    res.json({ message: 'landing berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus landing', error });
  }
});

module.exports = router;
