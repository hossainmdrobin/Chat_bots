import { auth } from "@/auth";
import { Chat, connectToDatabase } from "@/lib/models";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const chats = await Chat.find({ user: email })
    .sort({ updatedAt: -1 })
    .select("title createdAt updatedAt")
    .lean();

  return Response.json(
    chats.map((chat) => ({
      id: String(chat._id),
      title: chat.title ?? "New chat",
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    })),
  );
}