// database.js
import { MongoClient } from 'mongodb';

const connectToDatabase = async () => {
  try {
    const url = 'mongodb://localhost:27017';
    const dbName = 'carRental'; 

    const client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();

    console.log('Connected to the database!');
    return client.db(dbName);
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
};

export default connectToDatabase;
