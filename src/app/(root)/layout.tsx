"use client";

import Navbar from "@/components/Navbar";
import ConversationList from "@/components/sidebar/ConversationList";
import NewChatButton from "@/components/sidebar/NewChatButton";

export default function RootAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex h-screen flex-col bg-[#0f1117]">
      {/* Navbar is rendered at the top of every protected page */}
      <Navbar />

      {/* ===== Main Content Area: Sidebar + Chat ===== */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="relative hidden w-80 flex-col border-r border-gray-800 bg-[#1a1d27] md:flex">
          <NewChatButton />
          <div className="mt-2 flex flex-1 flex-col overflow-hidden">
            <ConversationList />
          </div>
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
