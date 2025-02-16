import express from 'express';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
import connectMongoDb from './db/connectMongoDb.js';
const app = express();
dotenv.config();// we use dotenv to access the environment variables
app.use("/api/auth",authRoutes) // if we visit /api/auth, it will redirect to authRoutes
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDb(); // once the server is running, we connect to the database
    });