# BillSamajh AI - Smart Utility Bill Explainer for India

> **"Understand Your Bill. Not Just Pay It."**

BillSamajh AI is an AI-powered utility bill analysis platform designed specifically for Indian households. It reads your electricity, water, mobile, and internet bills, explains every charge in simple language, predicts your next bill, and gives you personalized money-saving tips.

---

## Problem We're Solving

Utility bills in India are notoriously complex:
- **Multiple tariff slabs** that make calculation confusing
- **Technical jargon** most people can't understand
- **Hidden surcharges** and government levies that inflate bills unexpectedly
- **No usage breakdown** to identify what's consuming the most
- **Sudden bill spikes** with no explanation provided

Most payment apps only tell you how much to pay. BillSamajh AI tells you **why** you're paying that amount and **how to pay less**.

---

## What BillSamajh AI Does

1. **Upload** a photo or PDF of your bill
2. **AI analyzes** every line item using advanced computer vision and language models
3. **Get explanations** in simple, jargon-free language (Hinglish or 5 other Indian languages)
4. **Compare bills** side-by-side to track your usage and costs over time
5. **Predict your next bill** with AI-powered forecasting
6. **Receive personalized tips** on how to reduce your bills
7. **Discover government schemes** and subsidies you might be eligible for

---

## Key Features

| Feature | Description |
|---------|-------------|
| Multi-Bill Support | Analyze Electricity, Water, Mobile, and Internet bills |
| Multi-Language AI | Get explanations in English, Hindi, Tamil, Telugu, Marathi, and Bengali |
| AI-Powered Explanations | Understand every charge with simple, human-friendly explanations |
| Next Bill Prediction | AI estimates your upcoming bill based on usage patterns |
| Bill Comparison | Compare any two bills side-by-side to spot trends |
| Personalized Savings Tips | Actionable recommendations based on your actual consumption |
| Government Schemes | Discover subsidies and programs available in your state |
| Bill History | Track and manage all your past bill analyses |
| Analytics Dashboard | Visualize consumption trends with charts and graphs |
| Privacy First | No permanent data storage. Your data is yours. |

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization

### Backend & AI
- **Lovable Cloud** - Backend infrastructure (PostgreSQL, Auth, Edge Functions)
- **Google Gemini 2.5 Flash** - AI model for bill analysis via Lovable AI Gateway
- **Deno Edge Functions** - Serverless API endpoints

### Key Libraries
- React Router DOM - Client-side routing
- TanStack Query - Server state management
- Zod - Schema validation
- jsPDF - PDF report generation

---

## Architecture

```
User Uploads Bill (Image/PDF)
    |
    v
React Frontend (Vite + Tailwind + shadcn/ui)
    |
    v
Edge Function (Deno Runtime)
    |
    v
Google Gemini 2.5 Flash AI
- OCR + Structured Data Extraction
- Bill Explanation Generation
- Savings Tip Prediction
    |
    v
Lovable Cloud (PostgreSQL)
- Bill History Storage
- User Authentication (RLS secured)
    |
    v
User Sees Results
- Summary + Explanation
- Predictions + Tips
- Comparison + Analytics
```

---

## Supported Providers

### Electricity Boards
MSEDCL, TPDDL, BSES, CESC, TANGEDCO, BESCOM, APSPDCL, UPPCL, PGVCL, WBSEDCL, and all state electricity boards

### Water Boards
Delhi Jal Board, BWSSB, MCGM, CMWSSB, HMWSSB, PHED, KWA

### Mobile Operators
Jio, Airtel, Vi (Vodafone Idea), BSNL, MTNL

### Internet/Broadband
Jio Fiber, Airtel Xstream, ACT Fibernet, BSNL Fiber, Tata Play Fiber, Hathway, Tikona

---

## Unique Selling Points

| Comparison | Payment Apps | BillSamajh AI |
|------------|-------------|---------------|
| Bill Understanding | Shows amount due only | Explains every charge in simple language |
| Usage Analysis | No breakdown | Identifies high-consumption periods |
| Next Bill Prediction | Not available | AI-powered monthly estimates |
| Savings Tips | Generic advice | Personalized to your actual usage |
| Data Privacy | Linked to payments | No permanent data storage |
| Language Support | English only | 6 Indian languages |

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bill-samajh-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Setup

The project uses Lovable Cloud for backend services. For local development:

1. Create a `.env` file in the project root
2. Add your environment variables (Lovable automatically configures Supabase credentials)
3. Ensure your Lovable Cloud backend is active

---

## Core Pages

| Page | Description |
|------|-------------|
| `/` | Landing page with problem statement and solution |
| `/upload` | Bill upload with type and language selection |
| `/insights` | AI analysis results (summary, explanation, predictions, tips) |
| `/compare` | Side-by-side bill comparison with auto-sorting |
| `/analytics` | Usage trends, forecasts, and government schemes |
| `/history` | Manage past bill analyses with delete option |
| `/learn` | Educational resources about utility billing |
| `/technology` | How the technology works (AI, OCR, cloud) |

---

## Security

- **Row-Level Security (RLS)** - Users can only access their own data
- **CORS Restricted** - Edge functions only accept requests from trusted domains
- **Input Validation** - All user inputs are validated for type, size, and format
- **No Permanent Storage** - Bill data is processed in real-time, not stored permanently by default

---

## Project Context

This project was built with a focus on **accessibility and simplicity** for everyday Indian consumers. The design philosophy centers on:
- **Clarity over complexity** - Every piece of information is explained
- **Multi-language support** - Because language should not be a barrier to understanding your bills
- **Privacy first** - Your financial data stays private
- **No over-engineering** - Table-first design, clean UI, intuitive flow

---

## Roadmap

- [x] Multi-bill type support (Electricity, Water, Mobile, Internet)
- [x] Multi-language AI explanations
- [x] Bill comparison with auto-sorting
- [x] Bill history with delete functionality
- [x] Analytics dashboard with forecasting
- [x] Government schemes lookup
- [ ] Real-time government scheme API integration
- [ ] Mobile app (React Native)
- [ ] WhatsApp bot integration for bill analysis
- [ ] Community savings challenges

---

## License

This project is open source and available for educational and personal use.

---

## Acknowledgements

- Built with [Lovable](https://lovable.dev) - AI-powered app builder
- AI analysis powered by Google Gemini 2.5 Flash
- Component library: [shadcn/ui](https://ui.shadcn.com)
- Icons: [Lucide](https://lucide.dev)

---

> **Note:** This README reflects the current state of the project. For the most up-to-date information, refer to the codebase directly.
