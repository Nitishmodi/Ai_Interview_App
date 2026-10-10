import { Manrope } from "next/font/google";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: { default: "DevPilot AI", template: "%s · DevPilot AI" },
  description: "A hiring screen for recruiters and candidates.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sans.variable} scroll-smooth`}>
      <body className="bg-[#0c0e12] font-sans text-[#f3f0e8] antialiased">{children}</body>
    </html>
  );
}
