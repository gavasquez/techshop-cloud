import { Router, RequestHandler } from "express";
import { CartController } from "../controllers/cart/CartController";
import { CartUseCase } from "../../../application/cart/CartUseCase";
import { CartMongoRepository } from "../../../infrastructure/mongoose/cart/CartMongoRepository";
import { AuthMiddleware } from "../../../infrastructure/security/AuthMiddleware";
import { JwtTokenProvider } from "../../../infrastructure/security/JwtTokenProvider";
import { UserMongoRepository } from "../../../infrastructure/mongoose/user/UserMongoRepository";

const cartRepository = new CartMongoRepository();
const cartUseCase = new CartUseCase(cartRepository);
const cartController = new CartController(cartUseCase);

// Auth middleware setup
const userRepo = new UserMongoRepository();
const jwtTokenProvider = new JwtTokenProvider();
const authMiddleware = new AuthMiddleware(jwtTokenProvider, userRepo);

const cartRoutes = Router();

// All cart routes require authentication
cartRoutes.post("/", authMiddleware.authenticate as RequestHandler, cartController.addToCart as RequestHandler);
cartRoutes.get("/:userId", authMiddleware.authenticate as RequestHandler, cartController.getCartItems as RequestHandler);
cartRoutes.delete("/:id", authMiddleware.authenticate as RequestHandler, cartController.removeFromCart as RequestHandler);
cartRoutes.delete("/clear/:userId", authMiddleware.authenticate as RequestHandler, cartController.clearCart as RequestHandler);

export default cartRoutes;
