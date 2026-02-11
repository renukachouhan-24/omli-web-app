import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers"; 
import { Lexend } from 'next/font/google'

const lexend = Lexend({ 
  subsets: ['latin'],
  display: 'swap', 
})

export const metadata: Metadata = {
  title: "Bunni Kids AI",
  description: "A friendly AI companion for kids",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${lexend.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}