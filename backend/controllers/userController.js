import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import Notification from '../models/notificationModel.js';
import {v2 as cloudinary}from 'cloudinary';
export const getUsersProfile = async(req,res)=>{
    const {userName} = req.params;//we get dynamic parameter from the url
    try {
        const user =await User.findOne({userName:userName}).select("-password");//we find the user by userName and we exclude the password field
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json({user});//return user as a response
    } catch (error) {
        res.status(500).json({message:error.message});
        
    }

}
export const getSuggestions = async(req,res)=>{
try {
    const currentUserId = req.user._id // we get the current user from the token from the protectedRoute middleware where we added user to the request object
    const usersFollowedbyCurrentUser = await User.findById(currentUserId).select("following");// we find the current user by the userId and we only select the following field
    const users = await User.aggregate([
        {
            $match: {
                _id: { $ne: currentUserId },// we exclude the current user from the suggestions
            },
        },
        { $sample: { size: 10 } },
    ]);
    const filteredUsers = users.filter((user) => !usersFollowedbyCurrentUser.following.includes(user._id));// we filter out the users that the current user is already following
    const suggestions = filteredUsers.slice(0,5);// we get the first 5 users from the filteredUsers array
    suggestions.forEach((user) => (user.password = null));
    res.status(200).json(suggestions);//return suggestions as a response
} catch (error) {
    console.log("Error in getSuggestedUsers: ", error.message);
    res.status(500).json({message:error.message});
    
}
}
export const followUnfollowUser = async(req,res)=>{
try {
    const {userId} = req.params;//we get dynamic parameter from the url
    const userToFollow = await User.findById(userId);//we find the user by userId
    const currentUser = await User.findById(req.user._id);// we get the current user from the token from the protectedRoute middleware where we added user to the request object
    if(!userToFollow || !currentUser){
        return res.status(404).json({message:"User not found"});
    }
    if(userId === req.user._id.toString()){
        return res.status(400).json({error:"You cannot follow yourself"});
    }

    const isFollowing = currentUser.following.includes(userId);// we check if the current user is following the userToFollow
    if(isFollowing){
        //if the current user is following the userToFollow, we unfollow the user
        await User.findByIdAndUpdate(req.user._id,{$pull:{following:userId}});// we remove the userId from the following array of the current user
        await User.findByIdAndUpdate(userId,{$pull:{followers:req.user._id}});// we remove the current user from the followers array of the userToFollow
        const newNotification = new Notification({
            from:req.user._id,
            to:userToFollow._id,
            type:"follow"
        });
        await newNotification.save();// we save the new notification to the database
        //todo: return the id of the user as a response
        res.status(200).json({userId,message:"User unfollowed successfully"});

    }else{
        //if the current user is not following the userToFollow, we follow them
        await User.findByIdAndUpdate(req.user._id,{$push:{following:userId}});// we add the userId to the following array of the current user
        await User.findByIdAndUpdate(userId,{$push:{followers:req.user._id}});// we add the current user to the followers array of the userToFollow
        
        const newNotification = new Notification({
            from:req.user._id,
            to:userToFollow._id,
            type:"follow"
        });
        await newNotification.save();// we save the new notification to the database
        //todo: return the id of the user as a response
        res.status(200).json({userId,message:"User followed successfully"});
    }
} catch (error) {
    res.status(500).json({message:error.message});
    
}
}
export const updateProfile = async(req,res)=>{
    const {fullName,userName,email,bio,link,currentPassword,newPassword} = req.body;//we get the fields from the request body
    let {profilePicture,coverImagePicture: coverPicture} = req.body;
    const userId= req.user._id;// we get the current user from the token from the protectedRoute middleware where we added user to the request object
    try {
        let user = await User.findById(userId);// we find the user by userId
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        if((!currentPassword && newPassword)||(currentPassword && !newPassword)){
            return res.status(400).json({message:"Please provide both currentPassword and newPassword"});
        }
        if(currentPassword&&newPassword){
            const  isPasswordMatch = await bcrypt.compare(currentPassword,user.password);// we compare the currentPassword with the password in the database
            if(!isPasswordMatch){
                return res.status(400).json({message:"Invalid password"});
            }
            if(newPassword.length<6){
                return res.status(400).json({message:"Password must be at least 6 characters"});
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword,salt);
     
        }
        if(profilePicture){
            if (user.profilePicture) {
                await cloudinary.uploader.destroy(user.profilePicture.split("/").pop().split(".")[0])//if we already have a profile pic we should delete it from cloudinary
                
            }
            const uploadedProfilePic=await cloudinary.uploader.upload(profilePicture)
            profilePicture=uploadedProfilePic.secure_url;//our uploaded result

        }
        if(coverPicture){
            if (user.coverPicture) {
                await cloudinary.uploader.destroy(user.coverPicture.split("/").pop().split(".")[0])//if we already have a cover pic we should delete it from cloudinary
                
            }
            const uploadedCoverPic=await cloudinary.uploader.upload(coverPicture)
            coverPicture=uploadedCoverPic.secure_url;//our uploaded result
            
        }
        user.fullName=fullName||user.fullName;
        user.email=email||user.email;
        user.userName=userName||user.userName;
        user.bio=bio||user.bio;
        user.link=link||user.link;
        user.profilePicture=profilePicture||user.profilePicture;
        user.coverPicture=coverPicture||user.coverPicture;

        user = await user.save();
        user.password=null;//we dont want to return the password as a result
        res.status(200).json(user);//return user as a response
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}
