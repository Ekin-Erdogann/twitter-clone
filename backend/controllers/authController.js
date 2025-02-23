import User from "../models/userModel.js";
import bcrypt from "bcryptjs";// we use bcrypt to hash the password
import {generateTokenAndSetCookie }from "../lib/utils/generateToken.js";
export const signup = async (req, res) => {
  try {

    const { userName, fullName, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }
    const existingUser = await User.findOne({
      userName: userName,
    });
    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }
    const existingEmail = await User.findOne({
        email: email,
        });
    if (existingEmail) {
        return res.status(400).json({
            message: "Email already exists",
        });
        }
    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters",
        });
        }

// we hash the password
const salt= await bcrypt.genSalt(10);
const hashedPassword= await bcrypt.hash(password,salt);

const newUser = new User({
   userName: userName,
   fullName: fullName,
    email: email,
    password:hashedPassword,
})
if(newUser){
    generateTokenAndSetCookie(res,newUser._id);
    await newUser.save();
    return res.status(201).json({
        _id: newUser._id,
        userName: newUser.userName,
        fullName: newUser.fullName,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profilePicture: newUser.profilePicture,
        coverPicture: newUser.coverPicture,
        bio: newUser.bio,
    });
}else{
    return res.status(400).json({
        message: "Invalid user data",
    });
}

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const login = async (req, res) => {
  try {
   const { userName, password } = req.body;
   const user = await User.findOne({
         userName: userName,
    });
const validPassword= await bcrypt.compare(password,user?.password || "");
if(!user || ! validPassword){
    return res.status(400).json({
        message: "Invalid credentials",
    });
}
generateTokenAndSetCookie(res,user._id);
res.status(200).json({
    _id: user._id,
    userName: user.userName,
    fullName: user.fullName,
    email: user.email,
    followers: user.followers,
    following: user.following,
    profilePicture: user.profilePicture,
    coverPicture: user.coverPicture,
    bio: user.bio,
});
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
    
  }
};

export const logout = async (req, res) => {
 try {
    res.cookie("jwt","",{maxAge:0});// we clear the cookie immediately
    res.status(200).json({
        message: "Logged out",
    });
 } catch (error) {
     console.log(error);
     res.status(500).json({
       message: "Server error"
     });    
    
 }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error",
        });
        
    }
}
