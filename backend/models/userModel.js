import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId, // a follower will be a type of ObjectId
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId, // a following will be a type of ObjectId
        ref: "User",
        default: [],
      },
    ],
    profilePicture: { type: String, default: "" },
    coverPicture: { type: String, default: "" },
    bio: { type: String, default: "" },
    link: { type: String ,default: ""},
    likedPosts:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: [],
    }]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);// we create a model from the schema to interact with the users collection like CRUD operations
export default User;
