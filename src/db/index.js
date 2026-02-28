import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB successfully 😂");
    }catch(error){
        console.error("Error connecting to MongoDB: 😭", error);
        process.exit(1); // Exit the process with a failure code
    }
}

export default connectDB;