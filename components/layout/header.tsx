import { UserSelector } from "@/components/user/user-selector";

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold italic">X-Calc</h1>
          </div>

          <div className="flex items-center gap-4">
            <UserSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
