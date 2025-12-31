import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Video,
  Mail,
  BarChart,
  Settings,
  LogOut,
  Menu,
  ChevronLeft
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Bookings", href: "/admin/bookings", icon: Calendar },
  { name: "Services", href: "/admin/services", icon: FileText },
  { name: "Invoices", href: "/admin/invoices", icon: DollarSign },
  { name: "Content", href: "/admin/content", icon: Video },
  { name: "Marketing", href: "/admin/marketing", icon: Mail },
  { name: "Reports", href: "/admin/reports", icon: BarChart },
  { name: "Settings", href: "/admin/settings", icon: Settings },
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
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-bold text-primary-foreground">M</span>
          </div>
          <div>
            <span className="font-semibold">Magic Paws</span>
            <Badge variant="secondary" className="ml-2 text-xs">Admin</Badge>
          </div>
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

      {/* Back to Client View */}
      <div className="border-t p-4 space-y-2">
        <Button variant="outline" size="sm" className="w-full justify-start" asChild>
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Client View
          </Link>
        </Button>
        <SignOutButton />
      </div>
    </div>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
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
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-semibold">Admin</span>
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
