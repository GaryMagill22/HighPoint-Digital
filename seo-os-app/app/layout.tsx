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
      <body>
        <nav>
          <a href="/">Home</a>{" | "}
          <a href="/clients">Clients</a>{" | "}
          <a href="/run">Run Module</a>{" | "}
          <a href="/history">History</a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
