import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URL}`);
        console.log(`Connected to MongoDB ${conn.connection.host}`);
    } catch (error) {
        console.log(process.env.MONGODB_URL);
        console.log("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;