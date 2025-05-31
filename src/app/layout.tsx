import "./globals.css";

export const metadata = {
    title: "FabioGPT",
    description: "Romance novel generator",
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
