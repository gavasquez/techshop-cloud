import { Schema, model, Document } from "mongoose";

export interface UserDocument extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
}

const UserSchema = new Schema<UserDocument>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "client" }
});

export const UserModel = model<UserDocument>("User", UserSchema);
