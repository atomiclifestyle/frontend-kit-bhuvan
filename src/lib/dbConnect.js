import mongoose from 'mongoose';

let isConnected;

export async function connectToDB() {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    const connectionString = `${process.env.MONGO_URI}`;
    // Connection options
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };

    const db = await mongoose.connect(connectionString, options);

    isConnected = db.connections[0].readyState;
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }

}