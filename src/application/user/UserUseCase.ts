import { UserRepository } from "../../domain/user/UserRepository";
import { User } from "../../domain/user/User";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export class UserUseCase {
    constructor(private readonly userRepo: UserRepository) { }

    async register(name: string, email: string, password: string): Promise<User> {
        const exists = await this.userRepo.findByEmail(email);
        if (exists) throw new Error("El usuario ya existe");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User(name, email, hashedPassword);
        return await this.userRepo.save(user);
    }

    async login(email: string, password: string): Promise<User> {
        const user = await this.userRepo.findByEmail(email);
        if (!user) throw new Error("Credenciales inválidas");

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error("Credenciales inválidas");

        return user;
    }

    async getProfile(id: string): Promise<User | null> {
        return await this.userRepo.findById(id);
    }
}
