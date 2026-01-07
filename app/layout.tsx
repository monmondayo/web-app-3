import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "実質タダ電卓 Pro | Nagoya Vibe Edition",
  description: "高級品のリセールバリューを計算し、実質タダを証明する電卓アプリ。ロレックス、エルメス、iPhoneなど、中古相場データから推定リセール価格を自動計算。",
  keywords: "リセールバリュー, 実質タダ, 高級品, 中古相場, ロレックス, エルメス, 資産価値",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
