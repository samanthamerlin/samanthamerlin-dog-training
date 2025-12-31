import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <span className="text-xl font-bold text-primary-foreground">M</span>
            </div>
            <span className="text-lg font-semibold">Magic Paws</span>
          </Link>
        </div>
      </header>

      {/* Auth content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Simple footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Magic Paws by Samantha Merlin
        </div>
      </footer>
    </div>
  );
}
