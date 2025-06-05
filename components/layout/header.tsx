import { UserSelector } from "@/components/user/user-selector";
import NekoLogo from "../ui/NekoLogo";

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <NekoLogo width={32} height={32} />
            <h1 className="text-2xl sm:text-3xl font-bold">neko+</h1>
          </div>

          <div className="flex items-center gap-4">
            <UserSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
