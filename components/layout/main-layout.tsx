import { Header } from "./header";
import { BottomNavBar } from "./bottom-nav-bar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-4 pb-20 md:pb-4">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}
