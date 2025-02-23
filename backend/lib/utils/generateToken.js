import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => { 
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { // userId is the payload, process.env.JWT_SECRET is the secret key, and expiresIn is the expiration time
        expiresIn: "15d",
        });
    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,// 15 days in milliseconds
        sameSite: "strict",// the cookie is sent only to the same site preventing CSRF attacks cross-site request forgery attacks
        httpOnly: true,// the cookie is not accessible via JavaScript preventing XSS attacks cross-site scripting attacks
        secure: process.env.NODE_ENV === "production",// the cookie is sent only via HTTPS in production
        });
}


