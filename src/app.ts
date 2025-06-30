import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './config/mongoose.config';
import productRoutes from './interfaces/http/routes/product.routes';
import routes from './interfaces/http/routes';

dotenv.config();

const app = express();
app.use(express.json());

// Set up routes
app.use('/api', routes);

app.get('/', (_, res) => {
    res.status(200).json({
        message: 'API is running',
    });
});

const start = async () => {
  await connectDatabase();
};

start();

export default app;
