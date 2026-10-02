import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    profilePicture: { type: String },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel: Model<User> =
  models.User ?? model<User>('User', userSchema);

export default UserModel;
