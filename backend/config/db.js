import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect("mongodb+srv://ishitasofficialmail_db_user:IMan8PdE26hfvirw@cluster0.2mahp0g.mongodb.net/Expense");
  console.log("MongoDB connected");
}