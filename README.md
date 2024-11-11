##env Variabel
MONGO_URI=mongodb://localhost:27017/pramuka
USER_EMAIL=pramuka2024@gmail.com
USER_PSWD=pramuka2025
BASE_URL=http://localhost:3000
JWT_SECRET=sdndesakolotpramuka

password = WcpKAOVMOF7skAX7
username = pramuka2025

const mongoose = require('mongoose');
const uri = "mongodb+srv://pramuka2025:WcpKAOVMOF7skAX7@pramuka.xl5h5.mongodb.net/?retryWrites=true&w=majority&appName=pramuka";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
try {
// Create a Mongoose client with a MongoClientOptions object to set the Stable API version
await mongoose.connect(uri, clientOptions);
await mongoose.connection.db.admin().command({ ping: 1 });
console.log("Pinged your deployment. You successfully connected to MongoDB!");
} finally {
// Ensures that the client will close when you finish/error
await mongoose.disconnect();
}
}
run().catch(console.dir);
