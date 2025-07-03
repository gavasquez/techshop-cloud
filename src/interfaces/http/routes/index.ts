import { Router } from 'express';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import userRoutes from './user.routes';

const routes = Router();

routes.use('/products', productRoutes);
routes.use("/cart", cartRoutes);
routes.use("/users", userRoutes);

export default routes;
