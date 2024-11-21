const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const { auth: authRoot, authPublic } = require('../auth'); // Ganti dengan path yang sesuai
const { PassThrough } = require('stream');
const LandingPage = require('../landingpage/landingSchema');
const Akredetasi = require('./akredetasiPramukaSchema');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URI,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URI,
    universe_domain: 'googleapis.com',
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
});

async function uploadFile(auth, fileBuffer, fileName) {
  const drive = google.drive({ version: 'v3', auth });
  const fileMetadata = {
    name: fileName,
    mimeType: 'application/pdf',
    parents: ['1hbyu2XGKSDgoxVdWn2RSzsvJQW85VTby'],
  };

  // Convert buffer to stream
  const stream = new PassThrough();
  stream.end(fileBuffer);

  const media = {
    mimeType: 'application/pdf',
    body: stream,
  };

  const file = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });

  await drive.permissions.create({
    fileId: file.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return file.data.id;
}

async function deleteFile(auth, fileId) {
  const drive = google.drive({ version: 'v3', auth });
  await drive.files.delete({
    fileId: fileId,
  });
}

router.get('/add', authRoot, async (req, res) => {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Akredetasi', url: '/akredetasi/allakredetasi' },
    { name: 'Add', url: '/akredetasi' },
  ];
  const landing = await LandingPage.find();
  res.render('akr/akrAdd', { user: req.user, landing: landing[0], layout: 'index', title: 'Akredetasi ', breadcrumb, isRoot: false, message: null });
});

router.post('/add', authRoot, upload.single('image'), async (req, res) => {
  const { title, category } = req.body;

  try {
    // Cek apakah file ada
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }

    const mainFileBuffer = req.file.buffer;
    const fileId = await uploadFile(auth, mainFileBuffer, req.file.originalname);
    const link = `https://drive.google.com/file/d/${fileId}/view`;

    // Simpan data ke MongoDB
    const newAkredetasi = new Akredetasi({
      title: title,
      link: link,
      fileId: fileId, // Menggunakan mainFileId sesuai skema
      category: category,
    });

    await newAkredetasi.save();

    res.status(200).json({
      status: 'sukses tambah data akredetasi',
      data: newAkredetasi,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading files');
  }
});

router.get('/edit/:id', authRoot, async (req, res) => {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Akredetasi', url: '/akredetasi/allakredetasi' },
    { name: 'Edit', url: '/' },
  ];
  try {
    const akredetasi = await Akredetasi.findById(req.params.id);
    if (!akredetasi) {
      return res.status(404).send('Akredetasi tidak ditemukan');
    }

    const landing = await LandingPage.find();
    res.render('akr/akrEdit', {
      user: req.user,
      landing: landing[0],
      layout: 'index',
      isRoot: false,
      title: 'Edit Akredetasi',
      breadcrumb,
      akredetasi,
      message: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching akredetasi');
  }
});

// Route untuk menangani pengiriman form edit
router.post('/edit/:id', authRoot, upload.single('image'), async (req, res) => {
  const { title, category } = req.body;

  try {
    const akredetasi = await Akredetasi.findById(req.params.id);
    if (!akredetasi) {
      return res.status(404).json({ message: 'Akredetasi tidak ditemukan' });
    }

    // Jika ada file baru yang diupload
    if (req.file) {
      // Hapus file lama dari Google Drive jika ada
      if (akredetasi.fileId) {
        await deleteFile(auth, akredetasi.fileId);
      }

      // Upload file baru dan update link
      const mainFileBuffer = req.file.buffer;
      const fileId = await uploadFile(auth, mainFileBuffer, req.file.originalname);
      const link = `https://drive.google.com/file/d/${fileId}/view`;
      akredetasi.link = link;
      akredetasi.fileId = fileId; // Update fileId
    }

    // Update judul dan kategori
    akredetasi.title = title;
    akredetasi.category = category;

    // Simpan perubahan ke database
    await akredetasi.save();

    res.status(200).json({
      status: 'sukses update data akredetasi',
      data: akredetasi,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating akredetasi' });
  }
});

// all categories
router.get('/allakredetasi', authPublic, async (req, res) => {
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Akredetasi', url: '/akredetasi/allakredetasi' },
  ];
  try {
    // Ambil semua data akredetasi

    const landing = await LandingPage.find();
    const akredetasiList = await Akredetasi.find();

    // Mengelompokkan data berdasarkan kategori tanpa duplikat
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
    // Render halaman dengan data yang telah difilter
    res.render('akr/akrAll', {
      akredetasi: filteredAkredetasi,
      user: req.user,
      landing: landing[0],
      isRoot: false,
      layout: 'index',
      title: 'Akreditasi Pramuka SDN Desakolot - Standar Pendidikan dan Pengakuan Resmi',
      breadcrumb,
      message: null,
      categoryCounts: categoryCountsArray,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan saat mengambil data akredetasi');
  }
});

function extractNumber(data) {
  const match = data.title.match(/^\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : Infinity; // Mengembalikan Infinity jika tidak ada angka di depan
}

router.get('/akr/:category', authPublic, async (req, res) => {
  const { category } = req.params; // Ambil kategori dari URL
  const breadcrumb = [
    { name: 'Home', url: '/' },
    { name: 'Akredetasi', url: '/akredetasi/allakredetasi' },
    { name: `${category}`, url: '/allakredetasi' },
  ];

  try {
    // Ambil semua akredetasi yang sesuai dengan kategori
    const akredetasiList = await Akredetasi.find({ category: category });

    const landing = await LandingPage.find();
    akredetasiList.sort((a, b) => extractNumber(a) - extractNumber(b));

    res.render('akr/akrByCategory', {
      akredetasi: akredetasiList,
      category: category,
      user: req.user,
      landing: landing[0],
      isRoot: false,
      layout: 'index',
      title: `Akreditasi Pramuka SDN Desakolot - ${category}`,
      breadcrumb,
      message: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan saat mengambil data akredetasi');
  }
});

router.delete('/delete/:id', authRoot, async (req, res) => {
  const { id } = req.params; // Ambil ID dari URL

  try {
    // Cari akredetasi berdasarkan ID
    const akredetasi = await Akredetasi.findById(id);
    if (!akredetasi) {
      return res.status(404).json({ message: 'Akredetasi tidak ditemukan' });
    }

    // Hapus file dari Google Drive jika ada
    if (akredetasi.fileId) {
      await deleteFile(auth, akredetasi.fileId);
    }

    // Hapus akredetasi dari database
    await Akredetasi.findByIdAndDelete(id);

    res.status(200).json({
      status: 'sukses menghapus akredetasi',
      data: akredetasi,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting akredetasi' });
  }
});

module.exports = router;
