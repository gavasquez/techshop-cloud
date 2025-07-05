import { UserRepository } from "../../domain/user/UserRepository";
import { User } from "../../domain/user/User";
import { AuthService } from "../../infrastructure/security/AuthService";
import { JwtTokenProvider } from "../../infrastructure/security/JwtTokenProvider";
import { PasswordEncoder } from "../../infrastructure/security/PasswordEncoder";

export class UserUseCase {
    private readonly authService: AuthService;

    constructor(private readonly userRepo: UserRepository) {
        const jwtTokenProvider = new JwtTokenProvider();
        const passwordEncoder = new PasswordEncoder();
        this.authService = new AuthService(jwtTokenProvider, passwordEncoder, userRepo);
    }

    async register(
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ): Promise<{ user: User; tokens?: any }> {
        const result = await this.authService.register({
            email,
            password,
            firstName,
            lastName
        });

        if (!result.success || !result.user) {
            throw new Error(result.message || "Error en el registro");
        }

        return {
            user: result.user,
            tokens: result.tokens
        };
    }

    async login(email: string, password: string): Promise<{ user: User; tokens: any }> {
        const result = await this.authService.login({
            email,
            password
        });

        if (!result.success || !result.user || !result.tokens) {
            throw new Error(result.message || "Credenciales inválidas");
        }

        return {
            user: result.user,
            tokens: result.tokens
        };
    }

    async getProfile(id: string): Promise<User | null> {
        return await this.userRepo.findById(id);
    }
}
