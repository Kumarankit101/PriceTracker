"use server"
import mongoose from "mongoose";

let isConnected = false; //variable to track connection taturs

export const connectToDb = async () => {
    mongoose.set("strictQuery", true);

    if(!process.env.MONOGODB_URI) return console.log("MONGOD_URI is not defined");

    if(isConnected) return console.log(" => using existing database connection")


    try {
        await mongoose.connect(process.env.MONOGODB_URI);
        isConnected =true
        console.log("MONOGODB Connected")
    } catch (error) {
        
    }
}