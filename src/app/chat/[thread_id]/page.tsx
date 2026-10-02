import { redirect } from "next/navigation";
import ChatShell from "@/components/ChatShell";

type Params = { params: Promise<{ thread_id: string }> };

const THREAD_ID_PATTERN = /^[a-fA-F0-9]{24}$/;

export default async function ChatThreadPage({ params }: Params) {
  const { thread_id } = await params;

  if (!THREAD_ID_PATTERN.test(thread_id)) {
    redirect("/");
  }

  return <ChatShell threadId={thread_id} />;
}
