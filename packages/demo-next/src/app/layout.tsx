import type { Metadata } from "next";
import Link from "next/link";

import "@component-library/css";

import "./globals.css";

export const metadata: Metadata = {
  title: "Component Library — Next.js Demo",
  description:
    "Headless component library with pure TypeScript core, using the @component-library/react adapter in Next.js.",
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/text-field", label: "TextField" },
  { href: "/checkbox", label: "Checkbox" },
  { href: "/radio-group", label: "RadioGroup" },
  { href: "/select", label: "Select" },
  { href: "/accordion", label: "Accordion" },
  { href: "/modal", label: "Modal" },
  { href: "/contact-form", label: "Contact Form" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <nav className="app-nav">
            <div className="nav-brand">⚡ CL + Next.js</div>
            <ul className="nav-links">
              {navItems.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
