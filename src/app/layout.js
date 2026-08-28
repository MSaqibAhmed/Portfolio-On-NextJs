import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata = {
  title: "Saqib Ahmed — Full-Stack Developer",
  description:
    "Saqib Ahmed is a Full-Stack Developer based in Pakistan specializing in the MERN stack — building clean, responsive and scalable web applications.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-mint text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
