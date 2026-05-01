import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Scale, FileText, ShieldCheck, Zap } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={`animate-fade-in ${styles.badge}`}>
            <Zap size={14} /> <span>Powered by Gemini 2.0 Flash</span>
          </div>
          <h1 className={`animate-slide-up delay-100 ${styles.title}`}>
            Empowering the <span className="text-gradient-patriotic">Indian Electorate</span> Through Intelligence
          </h1>
          <p className={`animate-fade-in delay-200 ${styles.subtitle}`}>
            DEMOCRATEACH is your state-of-the-art AI companion for navigating the world&apos;s largest democracy. 
            Real-time insights, candidate transparency, and secure malpractice reporting.
          </p>
          <div className={`animate-fade-in delay-300 ${styles.actions}`}>
            <Link href="/chat" className={styles.primaryBtn}>
              Start Consultations <ArrowRight size={18} />
            </Link>
            <Link href="/candidates" className={styles.secondaryBtn}>
              Explore Candidates
            </Link>
          </div>
        </div>
        <div className={`animate-float ${styles.heroImageWrapper}`}>
          <Image 
            src="/patriotic_ai_hero_1777616836226.png" 
            alt="Patriotic AI Hero" 
            className={styles.heroImage}
            width={600}
            height={600}
            priority
          />
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className="animate-fade-in">Core Capabilities</h2>
          <p className="animate-fade-in">Advanced tools designed to foster a transparent and educated voting process.</p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={`glass-card ${styles.featureCard}`}>
            <div className={styles.featureIconWrapper} style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
              <Bot size={28} />
            </div>
            <h3>Elite AI Agent</h3>
            <p>Engage with our Gemini-powered specialist for instant clarity on election laws, procedures, and history.</p>
          </div>

          <div className={`glass-card ${styles.featureCard}`}>
            <div className={styles.featureIconWrapper} style={{ background: 'rgba(19, 136, 8, 0.1)', color: 'var(--india-green)' }}>
              <Scale size={28} />
            </div>
            <h3>Incident Integrity</h3>
            <p>Report malpractice securely. Our AI analyzes evidence and drafts official reports for authorities.</p>
          </div>

          <Link href="/candidates" className={`glass-card ${styles.featureCard}`} style={{ textDecoration: 'none' }}>
            <div className={styles.featureIconWrapper} style={{ background: 'rgba(255, 153, 51, 0.1)', color: 'var(--saffron)' }}>
              <FileText size={28} />
            </div>
            <h3>Candidate Transparency</h3>
            <p>Access deep-dive profiles, financial disclosures, and backgrounds of every candidate in your constituency.</p>
          </Link>
        </div>
      </section>
      
      {/* Trust Section */}
      <section className={styles.trust}>
        <div className={`glass ${styles.trustCard}`}>
          <ShieldCheck size={32} color="var(--primary)" />
          <div>
            <h3>Privacy First Architecture</h3>
            <p>Your consultations and reports are protected with industry-standard encryption. Your identity is your choice.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
