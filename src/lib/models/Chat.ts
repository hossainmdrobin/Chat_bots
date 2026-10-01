import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const chatSchema = new Schema(
  {
    user: { type: String },
    title: { type: String }
  },
  { timestamps: true },
);

export type Chat = InferSchemaType<typeof chatSchema>;

export const ChatModel: Model<Chat> =
  models.Chat ?? model<Chat>('Chat', chatSchema);

export default ChatModel;