"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bot, Users, Scale, LogIn, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import styles from "./Navbar.module.css";

type UserProps = {
  userId: string;
  email: string;
  name: string;
} | null;

export default function Navbar({ user }: { user?: UserProps }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { name: "Agent", href: "/chat", icon: <Bot size={18} /> },
    { name: "Candidates", href: "/candidates", icon: <Users size={18} /> },
    { name: "Report", href: "/complaints", icon: <Scale size={18} /> },
  ];

  return (
    <nav className={styles.navContainer}>
      <div className={`glass ${styles.navbar}`}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Bot size={24} color="var(--saffron)" />
          </div>
          <span className={styles.logoText}>DEMOCRA<span className="text-gradient-patriotic">TEACH</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className={styles.navLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
          
          {user ? (
            <button onClick={handleLogout} className={styles.logoutBtn} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', fontWeight: 600 }}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          ) : (
            <Link href="/login" className={styles.navLink} style={{ marginLeft: '1rem' }}>
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className={styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={`glass ${styles.mobileMenu} animate-slide-up`}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileNavLink} ${pathname === link.href ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
          {user ? (
            <button onClick={handleLogout} className={styles.mobileNavLink} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          ) : (
            <Link href="/login" className={styles.mobileNavLink} onClick={() => setIsOpen(false)}>
              <LogIn size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
