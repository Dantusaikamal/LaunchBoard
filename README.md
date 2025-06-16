# LaunchBoard
**LaunchBoard** is a full-stack internal tool to plan, build, deploy, and manage SaaS applications. From development tracking to marketing, analytics, and revenue — LaunchBoard keeps everything in one place.

## 📦 Features

- App Tracker Dashboard
- Dev Progress & Kanban Tasks
- Marketing & Launch Planning
- Deployment & Domain Status
- Revenue Logging & Analytics
- Post-Launch Feedback & Notes
- Asset & Credential Management (Non-AI)
- Versioning, Bug Tracking, Goals

## 🛠️ Stack

- **Frontend**: Next.js + Tailwind + Shadcn UI
- **Backend**: Supabase (Auth, DB, Storage)
- **Deployment**: Vercel
- **State**: React Context

## 📁 Project Structure

```bash
launchboard/
├── app/                  # Next.js App Router pages
├── components/           # Reusable UI components
├── lib/                  # Utilities and Supabase client
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
├── styles/               # Tailwind/global styles
├── public/               # Static assets
├── supabase/             # SQL schema + migrations
├── README.md
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

## ⚙️ Setup

1. Clone the repo  
```bash
git clone https://github.com/Dantusaikamal//launchboard.git
cd launchboard
```

2. Install dependencies  
```bash
npm install
```

3. Configure Supabase  
- Create a project on [supabase.com](https://supabase.com)
- Copy `.env.example` → `.env.local` and add your keys

4. Run locally  
```bash
npm run dev
```

## 📤 Deployment

Deployed to [Vercel](https://vercel.com/)  
Push to `main` → auto-deploy

---

## 📄 License

MIT © [Dantu Sai Kamal]
