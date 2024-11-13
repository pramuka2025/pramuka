const User = require('./user/schemaUser');

const auth = async (req, res, next) => {
  try {
    const user = await User.find(); // Mengambil pengguna dari database

    // Pastikan ada pengguna dan token yang valid
    if (!user.length || !user[0].token) {
      return res.redirect('/'); // Jika tidak ada token, alihkan ke halaman utama
    }

    // Simpan data pengguna ke dalam req
    req.user = user[0]; // Anda bisa menyimpan seluruh objek pengguna atau hanya yang diperlukan

    next(); // Lanjutkan ke middleware atau rute berikutnya
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('dari auth Internal Server Error'); // Tangani kesalahan
  }
};

const authPublic = async (req, res, next) => {
  try {
    const user = await User.find(); // Mengambil pengguna dari database

    req.user = user[0]; // Anda bisa menyimpan seluruh objek pengguna atau hanya yang diperlukan

    next(); // Lanjutkan ke middleware atau rute berikutnya
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('dari auth public Internal Server Error'); // Tangani kesalahan
  }
};

module.exports = {
  auth,
  authPublic,
};
