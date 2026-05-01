"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowRight } from "lucide-react";
import styles from "../login/login.module.css"; // Reuse login styles

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      router.push("/login?message=Account created successfully. Please login.");
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`glass animate-fade-in ${styles.authCard}`}>
        <div className={styles.authHeader}>
          <div className={styles.iconWrapper} style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent)' }}>
            <UserPlus size={24} />
          </div>
          <h2>Create Account</h2>
          <p>Join DEMOCRATEACH to access AI voting tools.</p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading} style={{ background: 'var(--accent)' }}>
            {isLoading ? "Creating..." : "Sign Up"} <ArrowRight size={18} />
          </button>
        </form>

        <p className={styles.authFooter}>
          Already have an account? <Link href="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
