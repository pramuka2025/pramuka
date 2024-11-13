// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./schemaUser');
const router = express.Router();

// Register
router.get('/register', async (req, res) => {
  // const { email, password } = req.body;
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PSWD;

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Cek apakah pengguna sudah ada
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User  already exists' });
    }

    // Buat pengguna baru
    const newUser = new User({ email, password });
    await newUser.save();

    // Kirim respons sukses
    res.status(201).json({ message: 'User  registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// router.get('/', async (req, res) => {
//   try {
//     const users = await User.find(); // Mengambil semua pengguna dari database
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// router.get('/delete', async (req, res) => {
//   const userId = '672a28b68823a4234fd1c468';

//   try {
//     const result = await User.findByIdAndDelete(userId);
//     if (!result) {
//       return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
//     }
//     res.status(200).json({ message: 'Pengguna berhasil dihapus' });
//   } catch (error) {
//     res.status(500).json({ message: 'Terjadi kesalahan saat menghapus pengguna', error });
//   }
// });

router.post('/login', async (req, res) => {
  const { emailLogin, password } = req.body;
  console.log(emailLogin, password);

  try {
    const user = await User.findOne({ emailLogin });
    if (!user) return res.status(400).json({ message: 'Invalid emailLogin' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    // Generate token
    const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Simpan token ke dalam database
    user.token = token; // Pastikan field 'token' ada di skema User
    await user.save();
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    // Mengambil pengguna pertama dari database
    const users = await User.find(); // Mengambil semua pengguna
    const user = users[0]; // Mengambil pengguna pertama

    // Periksa apakah pengguna ditemukan
    if (!user) {
      return res.status(400).json({ message: 'User  not found or not logged in' });
    }

    // Hapus token dari pengguna
    user.token = null; // Menghapus token
    await user.save(); // Simpan perubahan

    res.json('success logout!');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
