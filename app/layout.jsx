import { Inter, Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Loaded even in the English UI: the generated disclosure is always Korean, so
// every screen renders Hangul somewhere. Skip these and the demo shows boxes.
const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSerifKR = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "TrustLabel",
  description: "Publish how your shop handles customer reviews, in 90 seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${notoSansKR.variable} ${notoSerifKR.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
