import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/khushbu_electronic_store';
  
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[Khushbu Electronic Store] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.log(`[Khushbu Electronic Store] Notice: MongoDB not reachable at ${uri}. Running in resilient offline mode.`);
    return null;
  }
};

export const isDatabaseConnected = () => isConnected;

