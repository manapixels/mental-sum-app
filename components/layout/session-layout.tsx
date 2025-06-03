interface SessionLayoutProps {
  children: React.ReactNode;
}

export function SessionLayout({ children }: SessionLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-4 pb-20 md:pb-4">
        {children}
      </main>
    </div>
  );
}
