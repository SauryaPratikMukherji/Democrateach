# 🗳️ DEMOCRATEACH: AI-Powered Election Intelligence

**DEMOCRATEACH** is a state-of-the-art digital platform designed to empower citizens with real-time electoral intelligence, candidate transparency, and democratic education. Powered by **Google Gemini AI** and **Supabase**, it provides a seamless, high-performance experience for the modern voter.

![DEMOCRATEACH Banner](https://img.shields.io/badge/AI-Powered-blueviolet?style=for-the-badge&logo=google-gemini)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)

---

## ✨ Key Features

### 🤖 1. AI Election Agent (Gemini Flash)
*   **Live RAG Intelligence**: Real-time Retrieval-Augmented Generation using DuckDuckGo and Wikipedia to provide up-to-the-minute candidate news.
*   **Gemini Vision**: Upload photos of political figures or election materials for instant AI identification and analysis.
*   **Multilingual Support**: Interaction in major Indian languages alongside English.

### 📊 2. Candidate Knowledge Base
*   **Transparent Profiles**: Access detailed backgrounds, criminal records, assets, and educational qualifications of political candidates.
*   **Constituency Intelligence**: Search for candidates specifically within your local voting area.

### 🛡️ 3. Malpractice Reporting
*   **Secure Submissions**: Report illegal election activities with photo evidence.
*   **AI Analysis**: Automated image analysis to detect potential malpractices in reported evidence.

### 📱 4. Modern Glassmorphic UI
*   **Responsive Design**: A premium, mobile-first interface optimized for all devices.
*   **Real-time Streaming**: Ultra-fast AI responses using plain-text streaming protocols.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Lucide Icons.
- **Backend**: Next.js API Routes, Prisma ORM.
- **Database**: Supabase (PostgreSQL) for high-availability cloud storage.
- **AI Engine**: Google Generative AI (Gemini 1.5 Flash).
- **Styling**: Vanilla CSS with modern Glassmorphic design principles.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A Supabase Project
- A Google AI (Gemini) API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/democrateach.git
   cd democrateach
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your_supabase_connection_string"
   JWT_SECRET="your_secret_key"
   GOOGLE_API_KEY="your_gemini_api_key"
   ```

4. **Sync Database Schema**:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.

## 📄 License
This project is licensed under the MIT License.

---
*Built with ❤️ for a more transparent Democracy.*
