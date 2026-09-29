import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas font-sans text-ink antialiased">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
