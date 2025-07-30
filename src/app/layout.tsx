import React from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'Privus',
  description: 'Votre application de confiance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#141414" />
        <link
          rel="apple-touch-icon"
          href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottQAAAABJRU5ErkJggg=="
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
