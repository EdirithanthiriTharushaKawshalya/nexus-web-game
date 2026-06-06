import { AuthProvider } from "@/game/hooks/useAuth";
import "@/app/globals.css";

export const metadata = {
  title: "Nexus - Multiplayer Tower Defense",
  description: "Cooperative real-time strategy defense",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
