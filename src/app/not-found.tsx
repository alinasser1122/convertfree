import Link from 'next/link';
import './globals.css';

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen grid place-items-center">
          <div className="text-center px-4">
            <h1 className="text-6xl font-extrabold gradient-text">404</h1>
            <p className="mt-3 text-lg text-muted">Page not found</p>
            <Link
              href="/en"
              className="mt-6 inline-flex rounded-xl bg-gradient-primary text-white px-5 py-3 font-medium"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
