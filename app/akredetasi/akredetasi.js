// const express = require('express');
// const multer = require('multer');
// const { google } = require('googleapis');
// const fs = require('fs');
// const path = require('path');
// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() }); // Tempat menyimpan file sementara

// const FileUpload = mongoose.model('FileUpload', fileUploadSchema);

// // Ganti dengan path ke file kredensial Anda
// const CREDENTIALS_PATH = 'credentials.json';
// const TOKEN_PATH = 'token.json';

// // Load client secrets from a local file.
// const { client_secret, client_id, redirect_uris } = JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).installed;
// const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// // Authorize a client with credentials, then call the Google Drive API.
// function authorize(callback) {
//   fs.readFile(TOKEN_PATH, (err, token) => {
//     if (err) return console.error('Token not found, please authenticate.');
//     oAuth2Client.setCredentials(JSON.parse(token));
//     callback(oAuth2Client);
//   });
// }
// // Upload file to Google Drive
// async function uploadFile(auth, filePath) {
//   const drive = google.drive({ version: 'v3', auth });
//   const fileMetadata = {
//     name: path.basename(filePath),
//     mimeType: 'application/pdf',
//   };
//   const media = {
//     mimeType: 'application/pdf',
//     body: fs.createReadStream(filePath),
//   };

//   const file = await drive.files.create({
//     resource: fileMetadata,
//     media: media,
//     fields: 'id',
//   });

//   return file.data.id;
// }

// // Route untuk upload file PDF
// router.post('/upload', upload.fields([{ name: 'mainFile' }, { name: 'subFiles' }]), async (req, res) => {
//   try {
//     const fileIds = [];
//     const fileLinks = [];

//     const { title, sub_akredetasi } = req.body; // Mengambil title dan sub_akredetasi dari body

//     authorize(async (auth) => {
//       // Upload file utama
//       const mainFilePath = req.files['mainFile'][0].path;
//       const mainFileId = await uploadFile(auth, mainFilePath);
//       const mainFileLink = `https://drive.google.com/file/d/${mainFileId}/view?usp=sharing`;

//       // Simpan ID dan link file utama
//       fileIds.push(mainFileId);
//       fileLinks.push(mainFileLink);

//       // Loop melalui setiap file sub akredetasi yang diupload
//       for (let i = 0; i < req.files['subFiles'].length; i++) {
//         const subFilePath = req.files['subFiles'][i].path;
//         const subFileId = await uploadFile(auth, subFilePath);
//         const subFileLink = `https://drive.google.com/file/d/${subFileId}/view?usp=sharing`;

//         // Simpan ID dan link file sub akredetasi
//         fileIds.push(subFileId);
//         fileLinks.push(subFileLink);
//       }

//       // Simpan data ke MongoDB
//       const newFileUpload = new FileUpload({
//         title: title,
//         link: mainFileLink, // Mengambil link dari file utama
//         sub_akredetasi:
//           sub_akredetasi.map((sub, index) => ({
//             title: sub.title,
//             link: fileLinks[index + 1], // Mengambil link dari file sub akredetasi
//           })) || [],
//       });

//       await newFileUpload.save();

//       res.json({
//         fileIds: fileIds,
//         fileLinks: fileLinks,
//       });
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error uploading files');
//   }
// });

// module.exports = router;
