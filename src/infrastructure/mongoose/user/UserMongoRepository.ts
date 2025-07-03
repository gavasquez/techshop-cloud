import { UserRepository } from "../../../domain/user/UserRepository";
import { User } from "../../../domain/user/User";
import { UserModel } from "./UserModel";

export class UserMongoRepository implements UserRepository {
    async save(user: User): Promise<User> {
        const saved = await UserModel.create(user);
        return new User(saved.name, saved.email, saved.password, saved.role as any, saved.id.toString());
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ email }).lean();
        if (!user) return null;
        return new User(user.name, user.email, user.password, user.role as any, user.id.toString());
    }

    async findById(id: string): Promise<User | null> {
        const user = await UserModel.findOne({ id }).lean();
        if (!user) return null;
        return new User(user.name, user.email, user.password, user.role as any, user.id.toString());
    }
}
