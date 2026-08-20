import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Bar Operations System",
  description: "Bar Operations Reconciliation & Profit System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
