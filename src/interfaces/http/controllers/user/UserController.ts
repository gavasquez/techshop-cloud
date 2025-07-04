import { Request, Response } from "express";
import { UserUseCase } from "../../../../application/user/UserUseCase";

export class UserController {
    constructor(private readonly userUseCase: UserUseCase) { }

    register = async (req: Request, res: Response) => {
        try {
            const { firstName, lastName, email, password } = req.body;
            const user = await this.userUseCase.register(firstName, lastName, email, password);
            res.status(201).json({ message: "Usuario registrado", user: user.toDto() });
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    };

    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await this.userUseCase.login(email, password);
            res.status(200).json({ message: "Login exitoso", user: user.toDto() });
        } catch (err: any) {
            res.status(401).json({ message: err.message });
        }
    };

    getProfile = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const user = await this.userUseCase.getProfile(id);
            if (!user) res.status(404).json({ message: "Usuario no encontrado" });
            res.status(200).json({ user: user?.toDto() });
        } catch (err) {
            res.status(500).json({ message: "Error al obtener perfil" });
        }
    };
}
