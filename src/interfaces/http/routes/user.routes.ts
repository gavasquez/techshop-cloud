import { Router, RequestHandler } from "express";
import { UserController } from "../controllers/user/UserController";
import { UserUseCase } from "../../../application/user/UserUseCase";
import { UserMongoRepository } from "../../../infrastructure/mongoose/user/UserMongoRepository";
import { AuthMiddleware } from "../../../infrastructure/security/AuthMiddleware";
import { JwtTokenProvider } from "../../../infrastructure/security/JwtTokenProvider";

const userRepo = new UserMongoRepository();
const userUseCase = new UserUseCase(userRepo);
const userController = new UserController(userUseCase);

// Auth middleware setup
const jwtTokenProvider = new JwtTokenProvider();
const authMiddleware = new AuthMiddleware(jwtTokenProvider, userRepo);

const userRoutes = Router();

// Protected routes (authentication required)
userRoutes.get("/profile/:id", authMiddleware.authenticate as RequestHandler, userController.getProfile as RequestHandler);

export default userRoutes;
