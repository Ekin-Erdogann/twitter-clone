import express from 'express';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';
import {v2 as cloudinary}from 'cloudinary';
import connectMongoDb from './db/connectMongoDb.js';
import cookieParser from 'cookie-parser';
const app = express();
dotenv.config();// we use dotenv to access the environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})//to configure cloudinary

app.use(express.json());// we use this to parse the body of the request
app.use(express.urlencoded({ extended: true }));// we use this to parse the body of the request in x-www-form-urlencoded format
app.use(cookieParser());// we use this to parse the cookies
app.use("/api/auth",authRoutes) // if we visit /api/auth, it will redirect to authRoutes
app.use("/api/users",userRoutes) // if we visit /api/users, it will redirect to userRoutes
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDb(); // once the server is running, we connect to the database
    });