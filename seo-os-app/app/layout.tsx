import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO OS App",
  description: "SEO Operating System — Internal Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
