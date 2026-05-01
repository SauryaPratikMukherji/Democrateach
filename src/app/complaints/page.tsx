"use client";

import Image from "next/image";
import { useState } from "react";
import { Upload, CheckCircle, AlertCircle, Scale, Image as ImageIcon, ShieldAlert, MapPin, ClipboardList, Zap } from "lucide-react";
import styles from "./complaints.module.css";

export default function ComplaintsPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location) {
      setError("Required fields missing.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: preview, userId: "anonymous" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return (
      <div className={styles.container}>
        <div className={`glass ${styles.successBox} animate-slide-up`}>
          <div className={styles.successHeader}>
            <CheckCircle size={56} className={styles.successIcon} />
            <h1 className="text-gradient-patriotic">Integrity Upheld</h1>
            <p>Your report has been encrypted and securely logged in the national database.</p>
          </div>
          
          <div className={styles.resultGrid}>
            <div className={`glass-card ${styles.resultCard}`}>
              <span className={styles.resultLabel}>REFERENCE ID</span>
              <code className={styles.resultValue}>{result.id}</code>
            </div>
            {result.imageAnalysis && (
              <div className={`glass-card ${styles.analysisBox}`}>
                <div className={styles.analysisHeader}>
                  <Zap size={20} color="var(--saffron)" />
                  <h3>AI Forensic Evidence Analysis</h3>
                </div>
                <p className={styles.analysisText}>{result.imageAnalysis}</p>
              </div>
            )}
          </div>

          <button 
            className={styles.resetBtn} 
            onClick={() => { setResult(null); setFormData({ title: "", description: "", location: "" }); setPreview(null); }}
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <ShieldAlert size={14} /> <span>Secure Malpractice Reporting</span>
        </div>
        <h1 className="animate-slide-up">Report <span className="text-gradient-patriotic">Malpractice</span></h1>
        <p className="animate-fade-in delay-200">
          Ensure a fair democratic process. Securely submit evidence regarding illegal election activities directly to the oversight AI.
        </p>
      </div>

      <div className={styles.formContainer}>
        <form className={`glass ${styles.formCard} animate-fade-in delay-300`} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label><ClipboardList size={16} /> Incident Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange}
                placeholder="E.g. Unauthorized interference at Station 5"
                required 
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label><MapPin size={16} /> Constituency / Location</label>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleInputChange}
                placeholder="E.g. Diamond Harbour, West Bengal"
                required 
                disabled={isLoading}
              />
            </div>

            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label>Detailed Incident Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange}
                placeholder="Provide a comprehensive account of the observations..."
                rows={4}
                required 
                disabled={isLoading}
              />
            </div>

            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label>Evidence (Photos)</label>
              <div className={styles.uploadArea}>
                {preview ? (
                  <div className={styles.previewContainer}>
                    <Image 
                      src={preview} 
                      alt="Evidence" 
                      className={styles.previewImage} 
                      width={400} 
                      height={300} 
                      unoptimized 
                    />
                    <button type="button" className={styles.changeBtn} onClick={() => setPreview(null)}>Remove Evidence</button>
                  </div>
                ) : (
                  <label className={styles.uploadLabel}>
                    <div className={styles.uploadIconWrapper}><ImageIcon size={32} /></div>
                    <div className={styles.uploadText}>
                      <strong>Click to upload evidence</strong>
                      <span>Maximum file size: 10MB</span>
                    </div>
                    <input type="file" className={styles.fileInput} accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? "Consulting AI Forensics..." : "Submit Formal Complaint"}
          </button>
        </form>

        <div className={`glass-card ${styles.trustSidebar} animate-fade-in delay-400`}>
          <h3><Scale size={20} /> Integrity Protocol</h3>
          <ul>
            <li>End-to-end encryption for all submissions.</li>
            <li>Direct AI-assisted evidence triangulation.</li>
            <li>Anonymized routing to relevant authorities.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
