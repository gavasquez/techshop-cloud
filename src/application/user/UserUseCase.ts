import { UserRepository } from "../../domain/user/UserRepository";
import { User } from "../../domain/user/User";
import bcrypt from "bcryptjs";

export class UserUseCase {
    constructor(private readonly userRepo: UserRepository) { }

    async register(
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ): Promise<User> {
        const exists = await this.userRepo.findByEmail(email);
        if (exists) throw new Error("El usuario ya existe");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User(email, firstName, lastName, hashedPassword);

        return await this.userRepo.save(user);
    }

    async login(email: string, password: string): Promise<User> {
        const user = await this.userRepo.findByEmail(email);
        if (!user) throw new Error("Credenciales inválidas");

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            user.recordFailedLogin();
            throw new Error("Credenciales inválidas");
        }

        user.recordLogin();
        return await this.userRepo.save(user);
    }

    async getProfile(id: string): Promise<User | null> {
        return await this.userRepo.findById(id);
    }
}
