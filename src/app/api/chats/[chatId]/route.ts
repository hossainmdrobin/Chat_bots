import { auth } from "@/auth";
import { Chat, connectToDatabase, Message } from "@/lib/models";

type Params = { params: Promise<{ chatId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = await params;
  await connectToDatabase();

  const chat = await Chat.findById(chatId).lean();
  if (!chat || chat.user !== email) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 }).lean();

  return Response.json({
    id: String(chat._id),
    title: chat.title ?? "New chat",
    messages: messages.map((message) => ({
      id: String(message._id),
      role: message.role as 'human' | 'ai',
      message: message.message ?? "",
      createdAt: (message as { createdAt?: Date }).createdAt?.toISOString() ?? "",
    })),
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = await params;
  await connectToDatabase();

  const chat = await Chat.findById(chatId);
  if (!chat || chat.user !== email) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  await Message.deleteMany({ chat: chatId });
  await Chat.deleteOne({ _id: chatId });

  return Response.json({ deleted: chatId });
}