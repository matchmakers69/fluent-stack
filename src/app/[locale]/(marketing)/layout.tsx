import { ChatWidget } from "@/components/chat/chat-widget";
import { Navbar, Footer } from "@/components/shared";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="root" className="flex flex-col min-h-screen pt-22.5">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
