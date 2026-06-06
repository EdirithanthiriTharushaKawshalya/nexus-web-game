import { AuthProvider } from "@/game/hooks/useAuth";
import OrientationCheck from "@/game/components/OrientationCheck";
import "@/app/globals.css";

export const metadata = {
  title: "Nexus - Multiplayer Tower Defense",
  description: "Cooperative real-time strategy defense",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 overflow-x-hidden">
        <AuthProvider>
          <OrientationCheck>
            {children}
          </OrientationCheck>
        </AuthProvider>
      </body>
    </html>
  );
}
