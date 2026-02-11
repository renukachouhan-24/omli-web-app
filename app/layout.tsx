// import type { Metadata } from "next";
// import "./globals.css";
// import Providers from "./providers"; 
// import { Lexend } from 'next/font/google'
// const lexend = Lexend({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: " Bunni Kids AI",
//   description: "A friendly AI companion for kids",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className="antialiased">
//         <Providers>
//           {children}
//         </Providers>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers"; 
import { Lexend } from 'next/font/google'

// Font ko configure kiya
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
      {/* lexend.className yahan add karne se poori app mein font apply ho jayega */}
      <body className={`${lexend.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}