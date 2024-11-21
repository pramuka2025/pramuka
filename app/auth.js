const User = require('./user/schemaUser');

// Fungsi untuk membuat Promise yang menolak setelah waktu tertentu
const timeoutPromise = (duration) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout exceeded')); // Menolak Promise setelah waktu habis
    }, duration);
  });
};

const auth = async (req, res, next) => {
  try {
    // Mengatur waktu tunggu 55 detik (55000 ms)
    const userPromise = User.find().readConcern('majority');
    const result = await Promise.race([userPromise, timeoutPromise(55000)]);

    // Pastikan ada pengguna dan token yang valid
    if (!result.length || !result[0].token) {
      return res.redirect('/');
    }

    // Simpan data pengguna ke dalam req
    req.user = result[0];

    next();
  } catch (error) {
    console.error('Error fetching user:', error);
    // Arahkan ke halaman error jika terjadi timeout atau error lainnya
    req.session.returnTo = req.originalUrl;
    res.redirect('/error');
  }
};

const authPublic = async (req, res, next) => {
  try {
    // Mengatur waktu tunggu 55 detik (55000 ms)
    const userPromise = User.find().readConcern('majority');
    const result = await Promise.race([userPromise, timeoutPromise(55000)]);

    req.user = result;

    next();
  } catch (error) {
    console.error('Error fetching user:', error);
    req.session.returnTo = req.originalUrl; // Simpan URL yang ingin diakses
    res.redirect('/error'); // Arahkan ke halaman error
  }
};

module.exports = {
  auth,
  authPublic,
};
