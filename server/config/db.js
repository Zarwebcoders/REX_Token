const mongoose = require('mongoose');

// Cache the database connection for serverless
let cachedConnection = null;

const connectDB = async () => {
    // If we have a cached connection, return it
    if (cachedConnection && mongoose.connection.readyState === 1) {
        console.log('Using cached MongoDB connection');
        return cachedConnection;
    }

    try {
        // Optimized connection options for Vercel serverless
        const options = {
            serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
            socketTimeoutMS: 45000,
            maxPoolSize: 10, // Connection pool size
            minPoolSize: 1,
        };

        const conn = await mongoose.connect(process.env.MONGO_URI, options);

        cachedConnection = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        return conn;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        cachedConnection = null;

        // Don't exit process in serverless environment
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        throw error;
    }
};

module.exports = connectDB;