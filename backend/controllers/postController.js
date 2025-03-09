import Post from "../models/postModel.js";
import cloudinary from "cloudinary";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
export const getUserPosts = async (req, res) => {
  try {
    const userName = req.params.username;
    const user= await User.findOne
    ({userName});
    if(!user){
      return res.status(400).json({error:"User not found"});
    }
    const posts = await Post.find({postedBy:user._id}).sort({createdAt:-1}).populate({path:"postedBy",select:"-password"}).populate({path:"comments.postedBy",select:"-password"});
    res.status(200).json({posts});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getFollowingPosts = async (req, res) => {
try {
  const userId = req.user._id;
  const user
  = await User.findById(userId);
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }
  const following= user.following;
  const followingPosts = await Post.find({postedBy:{$in:following}}).sort({createdAt:-1}).populate({path:"postedBy",select:"-password"}).populate({path:"comments.postedBy",select:"-password"})
  res.status(200).json({followingPosts});
} catch (error) {res.status(500).json({ error: error.message });
  
}
};
export const getLikes = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({ path: "postedBy", select: "-password" })
      .populate({ path: "comments.postedBy", select: "-password" });
    res.status(200).json({ likedPosts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "postedBy", select: "-password" })
      .populate({ path: "comments.postedBy", select: "-password" }); //we populate the postedBy field to get the user details
    if (posts.length === 0) {
      return res.status(200).json([]); //if there are no posts, we return an empty array
    }
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { image } = req.body;
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (!text && !image) {
      return res.status(400).json({ error: "Please enter text or image" });
    }
    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      image = uploadedResponse.secure_url; // we get the secure url of the image uploaded to cloudinary and store it in image
    }
    const newPost = new Post({
      postedBy: userId,
      text,
      image,
    });
    await newPost.save();
    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const likeUnlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    }
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } }); //we use updateOne to remove the userId from the likes array
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } }); //we use updateOne to remove the postId from the likedPosts array
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      await Post.updateOne({ _id: postId }, { $push: { likes: userId } }); //we use updateOne to add the userId to the likes array
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } }); //we use updateOne to add the postId to the likedPosts array
      res.status(200).json({ message: "Post liked successfully" });
      const notification = new Notification({
        from: userId,
        to: post.postedBy,
        type: "like",
      });
      await notification.save();
      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    if (!text) {
      return res.status(400).json({ error: "Please enter text" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    }
    const comment = {
      text,
      postedBy: userId,
    };
    post.comments.push(comment);
    await post.save();
    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    }
    const userId = req.user._id.toString();
    if (post.postedBy.toString() !== userId) {
      return res
        .status(400)
        .json({ error: "You cannot delete someone else's post" });
    }
    if (post.image) {
      const imageId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imageId);
    }
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
