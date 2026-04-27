// config/database.js — Singleton pattern for DB access
const mongoose = require('mongoose');

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    this.connection = null;
    Database.instance = this;
  }

  async connect() {
    if (this.connection) {
      return this.connection;
    }
    try {
      this.connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helpersdb', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        retryWrites: true,
        w: 'majority',
      });
      console.log('MongoDB connected (Singleton)');
      return this.connection;
    } catch (err) {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    }
  }

  getConnection() {
    return this.connection;
  }
}

// Export single instance
const instance = new Database();

module.exports = instance;
