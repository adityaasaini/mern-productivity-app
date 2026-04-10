// File Name: backend/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // ✅ Local MongoDB URL
        const DB_URL = "mongodb://127.0.0.1:27017/todo-app";

        await mongoose.connect(DB_URL);

        console.log("🔥 MongoDB (Local) Mongoose ke saath jud gaya!");
    } catch (error) {
        console.log("❌ DB Connection Fail:", error.message);
    }
};

export default connectDB;