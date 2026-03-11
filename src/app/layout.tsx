import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minecraft Dungeons RPG — The Arch-Illager Returns',
  description: 'A 2.5D isometric turn-based RPG set after Minecraft Dungeons. Choose your class, pick a faction, and save the Overworld.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
