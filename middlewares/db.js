import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export default async function connect() {
  try {
   
    await mongoose.connect(process.env.MONGODB_LINK);
    
    
    console.log("database connected");
  } catch (error) {
    console.log(error);
  }
}
