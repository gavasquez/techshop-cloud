import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import userRoutes from './user.routes';
import orderRoutes from './order.routes';

const routes = Router();

// Authentication routes (public)
routes.use('/auth', authRoutes);

// Protected routes
routes.use('/products', productRoutes);
routes.use("/cart", cartRoutes);
routes.use("/users", userRoutes);
routes.use("/orders", orderRoutes);

export default routes;
