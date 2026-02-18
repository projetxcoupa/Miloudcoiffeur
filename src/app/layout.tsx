import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Miloud Coiffeur - Barber Shop Premium à Oran",
    description: "Réservez votre coupe ou soin barbe chez Miloud Coiffeur. Expertise, style et ambiance Cyberpunk à Ain El Turk.",
    keywords: ["Coiffeur", "Barber Shop", "Oran", "Ain El Turk", "Coupe Homme", "Barbe", "Soins Visage"],
    authors: [{ name: "Miloud Coiffeur" }],
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Miloud Coiffeur",
    },
    openGraph: {
        title: "Miloud Coiffeur - Barber Shop Premium",
        description: "L'excellence de la coiffure masculine à Oran.",
        url: "https://miloud-coiffeur.vercel.app",
        siteName: "Miloud Coiffeur",
        locale: "fr_DZ",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Miloud Coiffeur",
        description: "Votre style, notre expertise.",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js');
                                });
                            }
                        `,
                    }}
                />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
