import React from 'react';
import '../styles/globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Privus',
  description: 'Votre application de confiance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111827" />
        <link
          rel="apple-touch-icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 2L2 7v10l10 5 10-5V7L12 2z'/%3E%3C/svg%3E"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <header className="bg-[#111827] text-[#f3f4f6] border-b border-[#2563eb]">
          <nav className="container mx-auto flex items-center justify-between p-4">
            <Link href="/" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-6 w-6 fill-[#2563eb]"
              >
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
              </svg>
              <span className="font-semibold">Privus</span>
            </Link>
            <div className="flex gap-4">
              <Link href="/">Chat</Link>
              <Link href="/agenda">Agenda</Link>
              <Link href="/store">Store</Link>
              <Link href="/settings">Paramètres</Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 container mx-auto p-4">{children}</main>
        <footer className="bg-[#111827] text-[#f3f4f6] text-center py-4 text-sm border-t border-[#2563eb]">
          © {year} Privus v1.0.0
        </footer>
      </body>
    </html>
  );
}
