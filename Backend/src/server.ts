import dotenv from 'dotenv';
dotenv.config();

import { connectDB, APP_CONFIG } from './config';
import app from './app';

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the server
    app.listen(APP_CONFIG.PORT, () => {
      console.log(`🚀 Server running on port ${APP_CONFIG.PORT}`);
      console.log(`📊 Environment: ${APP_CONFIG.NODE_ENV}`);
      console.log(`🔗 API Base: http://localhost:${APP_CONFIG.PORT}${APP_CONFIG.API_PREFIX}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();
