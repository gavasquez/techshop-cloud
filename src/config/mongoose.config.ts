import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGO_URI as string;
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error);
    process.exit(1);
  }
};
