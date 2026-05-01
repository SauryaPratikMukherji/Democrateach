"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Search, MapPin, GraduationCap, Briefcase, FileWarning, Globe, ChevronRight, Filter, Zap, Database } from "lucide-react";
import styles from "./candidates.module.css";

type Candidate = {
  id?: string;
  name: string;
  party?: string;
  partyAbbr?: string;
  constituency: string;
  criminalRecords?: string | null;
  assets?: string | null;
  education?: string | null;
  background: string;
  status?: string;
};

type Party = {
  id: string;
  name: string;
  abbreviation: string;
  foundedYear: number | null;
  description: string;
  candidates: Candidate[];
};

const INDIAN_STATES = [
  { name: "West Bengal", cities: ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur"] },
  { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"] },
  { name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida"] },
  { name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru"] },
  { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Salem"] },
  { name: "Delhi", cities: ["New Delhi", "North Delhi", "South Delhi"] },
  { name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"] },
];

export default function CandidatesPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Explorer State
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [constituency, setConstituency] = useState("");
  const [electionType, setElectionType] = useState("Lok Sabha");
  const [liveCandidates, setLiveCandidates] = useState<Candidate[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);

  const fetchParties = useCallback(async () => {
    try {
      const res = await fetch("/api/candidates");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setParties(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("Loading timed out, showing empty state");
        setLoading(false);
      }
    }, 5000);
    
    (async () => {
      await fetchParties();
      clearTimeout(timeout);
    })();
    
    return () => clearTimeout(timeout);
  }, [fetchParties, loading]);

  const handleLiveSearch = async () => {
    if (!selectedState || !constituency) return;
    setIsSearchingLive(true);
    setLiveCandidates([]);
    try {
      const res = await fetch("/api/candidates/live-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: selectedState, city: selectedCity, constituency, type: electionType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setLiveCandidates(data);
    } catch (err: any) {
      alert(`Search error: ${err.message}`);
    } finally {
      setIsSearchingLive(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/candidates/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sync");
      setSyncMessage(data.message);
      await fetchParties();
    } catch (err: any) {
      setSyncMessage(`Error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredParties = parties.map(party => ({
    ...party,
    candidates: party.candidates.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.constituency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(party => party.candidates.length > 0 || party.name.toLowerCase().includes(searchTerm.toLowerCase()) || party.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className={styles.loading}>Initializing DEMOCRATEACH Core...</div>;

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.header}>
        <div className={styles.badge}>
          <div className={styles.livePulse}></div>
          <span>LIVE ELECTORAL INTEL</span>
        </div>
        <h1 className="animate-slide-up text-gradient-patriotic">Election Pulse</h1>
        <p className="animate-fade-in delay-200">
          Discover candidates and real-time electoral insights using the world&apos;s most advanced political AI.
        </p>
      </div>

      {/* Explorer Section */}
      <section className={`animate-fade-in delay-300 glass ${styles.explorerSection}`}>
        <div className={styles.explorerHeader}>
          <Zap size={20} color="var(--saffron)" />
          <h2>Deep Search Explorer</h2>
        </div>
        <div className={styles.explorerGrid}>
          <div className={styles.formGroup}>
            <label>State</label>
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
              <option value="">Choose State</option>
              {INDIAN_STATES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>City</label>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedState}>
              <option value="">Choose City</option>
              {INDIAN_STATES.find(s => s.name === selectedState)?.cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Constituency</label>
            <input 
              type="text" 
              placeholder="Enter area name..." 
              value={constituency}
              onChange={(e) => setConstituency(e.target.value)}
              className={styles.constituencyInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Election Tier</label>
            <div className={styles.toggleGroup}>
              <button 
                className={electionType === "Lok Sabha" ? styles.activeToggle : ""} 
                onClick={() => setElectionType("Lok Sabha")}
              >Lok Sabha</button>
              <button 
                className={electionType === "Vidhan Sabha" ? styles.activeToggle : ""} 
                onClick={() => setElectionType("Vidhan Sabha")}
              >Vidhan Sabha</button>
            </div>
          </div>
        </div>
        <button 
          className={styles.searchButton} 
          onClick={handleLiveSearch}
          disabled={isSearchingLive || !selectedState || !constituency}
        >
          {isSearchingLive ? "Consulting Global Data Nodes..." : "Initiate AI Lookup"}
        </button>

        {/* Live Results Table */}
        {liveCandidates.length > 0 && (
          <div className={`animate-slide-up ${styles.liveResults}`}>
            <div className={styles.liveResultsHeader}>
              <h3>Real-Time Insights for {constituency}</h3>
              <span className={styles.timestamp}>Source: Gemini 3.1 Flash-Lite</span>
            </div>
            <div className={styles.candidateTableWrapper}>
              <table className={styles.candidateTable}>
                <thead>
                  <tr>
                    <th>Candidate Profile</th>
                    <th>Political Identity</th>
                    <th>Contextual Background</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {liveCandidates.map((c, i) => (
                    <tr key={i} className="animate-fade-in" style={{animationDelay: `${i * 100}ms`}}>
                      <td>
                        <div className={styles.tableNameCell}>
                          <div className={styles.tableAvatar}>{c.name.charAt(0)}</div>
                          <div>
                            <strong>{c.name}</strong>
                            <div className={styles.tableSub}>{c.education}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.partyBadge} ${styles[c.partyAbbr?.toLowerCase() || '']}`}>
                          {c.partyAbbr}
                        </span>
                        <div className={styles.tableSub}>{c.party}</div>
                      </td>
                      <td><p className={styles.tableBackground}>{c.background}</p></td>
                      <td>
                        <span className={styles.statusBadge}>AI Confirmed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Database Section */}
      <div className={styles.dbDivider}>
        <Database size={16} />
        <span>CONSOLIDATED ELECTORAL ARCHIVE</span>
      </div>

      <div className={`animate-fade-in delay-500 ${styles.searchBar}`}>
        <Search size={20} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Filter archived parties and candidates..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <button onClick={handleSync} disabled={isSyncing} className={styles.miniSync}>
          {isSyncing ? "Syncing..." : "Refresh DB"}
        </button>
      </div>

      <div className={styles.grid}>
        {filteredParties.length === 0 ? (
          <div className={styles.loading}>No archive records found.</div>
        ) : (
          filteredParties.map((party) => (
            <div key={party.id} className={`animate-fade-in ${styles.partySection}`}>
              <div className={styles.partyHeader}>
                <div>
                  <h2>{party.name} <span className={styles.partyAbbr}>({party.abbreviation})</span></h2>
                  <p className={styles.partyDesc}>{party.description}</p>
                </div>
              </div>

              <div className={styles.candidateGrid}>
                {party.candidates.map((candidate) => (
                  <div key={candidate.id} className={`glass-card ${styles.candidateCard}`}>
                    <div className={styles.candidateHeader}>
                      <div className={styles.candidateAvatar}>{candidate.name.charAt(0)}</div>
                      <div className={styles.candidateInfo}>
                        <h3>{candidate.name}</h3>
                        <span className={styles.constituency}><MapPin size={14} /> {candidate.constituency}</span>
                      </div>
                    </div>
                    <div className={styles.candidateDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}><GraduationCap size={14}/> Education</span>
                        <span className={styles.detailValue}>{candidate.education || "Unknown"}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}><Briefcase size={14}/> Assets</span>
                        <span className={styles.detailValue}>{candidate.assets || "Unknown"}</span>
                      </div>
                    </div>
                    <div className={styles.background}>{candidate.background}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
