import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'JobPortal - Find your next role',
  description: 'A full-stack job portal for candidates and employers',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
