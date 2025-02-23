import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const protectedRoute = async (req, res, next) => {// it first calls /me then this function then the next function which is getMe
const token = req.cookies.jwt;// we get the token from the cookies
if (!token) {
    return res.status(401).json({
        message: "You are not authenticated",
    });
}
const decoded = jwt.verify(token, process.env.JWT_SECRET);// we decode the token
if (!decoded) {
    return res.status(401).json({
        message: "You are not authenticated",
    });
}
const user = await User.findById(decoded.userId).select("-password");// we find the user by the userId
if (!user) {
    return res.status(401).json({
        message: "You are not authenticated",
    });
}
req.user = user;// we add the user to the request object
next();// we call the next function
}

    