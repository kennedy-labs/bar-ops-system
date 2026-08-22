import "./globals.css";
import { ReactQueryProvider } from "@/components/ReactQueryProvider";

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
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
