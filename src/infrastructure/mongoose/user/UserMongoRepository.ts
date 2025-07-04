import { User } from "../../../domain/user/User";
import { UserRepository } from "../../../domain/user/UserRepository";
import { UserModel } from "./UserModel";

export class UserMongoRepository implements UserRepository {
  async save(user: User): Promise<User> {
    const data = user.toPersistence();
    const saved = await UserModel.create(data);
    return User.fromPersistence(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ email }).lean();
    if (!userDoc) return null;

    return User.fromPersistence({
      id: userDoc.id,
      email: userDoc.email,
      passwordHash: userDoc.passwordHash,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      roles: userDoc.roles,
      active: userDoc.active,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
      lastLoginAt: userDoc.lastLoginAt,
      emailVerified: userDoc.emailVerified,
      failedLoginAttempts: userDoc.failedLoginAttempts,
      lockedUntil: userDoc.lockedUntil,
    });
  }

  async findById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ id }).lean(); 
    if (!userDoc) return null;

    return User.fromPersistence({
      id: userDoc.id,
      email: userDoc.email,
      passwordHash: userDoc.passwordHash,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      roles: userDoc.roles,
      active: userDoc.active,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
      lastLoginAt: userDoc.lastLoginAt,
      emailVerified: userDoc.emailVerified,
      failedLoginAttempts: userDoc.failedLoginAttempts,
      lockedUntil: userDoc.lockedUntil,
    });
  }
}
