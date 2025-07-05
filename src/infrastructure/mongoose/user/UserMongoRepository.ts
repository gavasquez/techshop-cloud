import { User } from "../../../domain/user/User";
import { UserRepository } from "../../../domain/user/UserRepository";
import { UserModel } from "./UserModel";

export class UserMongoRepository implements UserRepository {
  async save(user: User): Promise<User> {
    const data = user.toPersistence();
    
    if (data.id) {
      // Update existing user using MongoDB _id
      const updated = await UserModel.findByIdAndUpdate(
        data.id,
        data,
        { new: true, runValidators: true }
      );
      
      if (!updated) {
        throw new Error('User not found');
      }
      
      return this.mapToUser(updated);
    } else {
      // Create new user - MongoDB will generate _id automatically
      const { id, ...userData } = data; // Remove id field for new users
      const saved = await UserModel.create(userData);
      return this.mapToUser(saved);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ email }).lean();
    if (!userDoc) return null;

    return this.mapToUser(userDoc);
  }

  async findById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findById(id).lean(); 
    if (!userDoc) return null;

    return this.mapToUser(userDoc);
  }

  async delete(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }

  private mapToUser(doc: any): User {
    const data = doc.toObject ? doc.toObject() : doc;
    return User.fromPersistence({
      id: data._id.toString(), // MongoDB ObjectId converted to string
      email: data.email,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      roles: data.roles,
      active: data.active,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLoginAt: data.lastLoginAt,
      emailVerified: data.emailVerified,
      failedLoginAttempts: data.failedLoginAttempts,
      lockedUntil: data.lockedUntil,
    });
  }
}
