"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, MapPin, FileWarning } from "lucide-react";
import styles from "./dashboard.module.css";
import Link from "next/link";

type Complaint = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  imageAnalysis: string | null;
  createdAt: string;
};

export default function DashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch("/api/user/complaints");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load complaints");
        
        const data = await res.json();
        setComplaints(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComplaints();
  }, [router]);

  if (loading) return <div className={styles.loading}>Loading your dashboard...</div>;
  if (error) return <div className={styles.container}><div className={styles.emptyState}>Error: {error}</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Dashboard</h1>
        <p>Track your submitted complaints and view AI analysis reports.</p>
      </div>

      <div className={styles.dashboardGrid}>
        <section className={styles.complaintsSection}>
          <h2 className={styles.sectionTitle}>
            <LayoutDashboard size={24} />
            My Reports
          </h2>

          {complaints.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven&apos;t submitted any complaints yet.</p>
              <Link href="/complaints" style={{ color: 'var(--primary)', marginTop: '1rem', display: 'inline-block' }}>
                Submit a Report
              </Link>
            </div>
          ) : (
            <div className={styles.complaintList}>
              {complaints.map((complaint) => (
                <div key={complaint.id} className={`glass ${styles.complaintCard}`}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3>{complaint.title}</h3>
                      <span className={styles.location}>
                        <MapPin size={14} /> {complaint.location}
                      </span>
                    </div>
                    <span className={styles.status}>{complaint.status}</span>
                  </div>
                  
                  <p className={styles.description}>{complaint.description}</p>
                  
                  {complaint.imageAnalysis && (
                    <div className={styles.analysisBox}>
                      <div className={styles.analysisTitle}>
                        <FileWarning size={14} style={{ display: 'inline', marginRight: '6px' }} />
                        Vision AI Analysis
                      </div>
                      <p className={styles.analysisText}>{complaint.imageAnalysis}</p>
                    </div>
                  )}
                  
                  <div className={styles.date}>
                    Submitted on {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
