import { Router } from "express";
import { UserController } from "../controllers/user/UserController";
import { UserUseCase } from "../../../application/user/UserUseCase";
import { UserMongoRepository } from "../../../infrastructure/mongoose/user/UserMongoRepository";

const userRepo = new UserMongoRepository();
const userUseCase = new UserUseCase(userRepo);
const userController = new UserController(userUseCase);

const userRoutes = Router();

userRoutes.post("/register", userController.register);
userRoutes.post("/login", userController.login);
userRoutes.get("/profile/:id", userController.getProfile);

export default userRoutes;
