import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Dog, Calendar, FileText, GraduationCap, Settings, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Dogs", href: "/dashboard/dogs", icon: Dog },
  { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Training", href: "/dashboard/training", icon: GraduationCap },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

async function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <Button variant="ghost" size="sm" className="w-full justify-start" type="submit">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </form>
  );
}

function Sidebar() {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-bold text-primary-foreground">M</span>
          </div>
          <span className="font-semibold">Magic Paws</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {sidebarLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <link.icon className="mr-3 h-4 w-4" />
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="border-t p-4">
        <SignOutButton />
      </div>
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-card md:block">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b px-4 md:hidden">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-semibold">Magic Paws</span>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
