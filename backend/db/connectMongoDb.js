import mongoose from "mongoose";

const connectMongoDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);// we connect to the database
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);// if there is an error, we exit the process
  }
};

export default connectMongoDb;
