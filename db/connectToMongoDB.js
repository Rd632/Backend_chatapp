import mongoose from "mongoose";

const connectToMongoDB = async () => {
  const uri = process.env.MONGO_DB_URI;

  if (!uri) {
    throw new Error("❌ MONGO_DB_URI is not defined in your .env file");
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1); // Optional: Exit if connection fails
  }
};

export default connectToMongoDB;
