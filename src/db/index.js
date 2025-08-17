import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGO_URI // Ensure your environment variable is set properly
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB connection FAILED", error.message); // Log the error message for clarity
    process.exit(1); // Exit the process on failure
  }
};

export default connectDB;
