import { AuthNavbar, Footer } from "@/components/shared";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
