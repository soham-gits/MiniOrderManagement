import mongoose from "mongoose";

export const connectDB = async (mongoURI: string) => {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");
    } catch (error: any) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};
