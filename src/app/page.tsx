import { cookies } from "next/headers";
import { auth } from "@/auth";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import SignInGate from "@/components/auth/SignInGate";
import { REMEMBERED_ACCOUNT_COOKIE, readRememberedAccount } from "@/lib/auth/remembered-account";

export default async function Home() {
  const session = await auth();
  const email = session?.user?.email ?? null;

  if (!email) {
    const rememberedEmail = readRememberedAccount(
      (await cookies()).get(REMEMBERED_ACCOUNT_COOKIE)?.value
    );

    return <SignInGate rememberedEmail={rememberedEmail} />;
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas font-sans text-ink antialiased">
      <Sidebar userEmail={email} />
      <ChatWindow />
    </div>
  );
}