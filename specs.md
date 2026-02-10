# BUILD SPEC: MVP for "PropLead" – Real Estate CRM + WhatsApp Automation

## 1. PRODUCT OVERVIEW

Build a SaaS web app (PWA-capable, mobile-responsive) for solo real estate agents and small brokerages firms / agencies

Core value:
Never miss follow-ups → auto WhatsApp messages + pipeline tracking → close more deals.
Capture leads from forms & WhatsApp
Manage leads in a CRM pipeline
Automatically send WhatsApp follow-ups
Set reminders for site visits & calls
View deal status in a dashboard

 
Goal: **Help agents close more deals by never missing follow-ups.**

## 2. TARGET USERS & DEVICES

- Solo agents + small teams (owner + agents).
- Desktop primary, mobile web responsive.

## 3. STRICT MVP SCOPE (Build ONLY these – no extras)

✅ Authentication
✅ Lead CRUD + CSV bulk import
✅ Rule based Lead Scoring
✅ WhatsApp send/receive (Meta Cloud API)
✅ Basic automation (welcome + timed follow-ups via cron-like)
✅ Reminders & tasks
✅ Simple dashboard (stats + follow-ups due)
✅ Basic AI assistant (draft replies + suggestions)
✅ Simple team (owner assigns leads to agents)
✅ Billing stub (Razorpay integration + trial)

## 4. CORE FEATURES DETAIL

### 4.1 Authentication (Firebase Auth)

- Email + Password login/signup
- Phone OTP (preferred for India – use Firebase phone auth)
- Forgot password (email reset)
- JWT via Firebase ID tokens

### 4.2 Lead Management (CRM)

Lead Fields (Firestore collection: leads):

- id (auto)
- user_id (owner)
- assigned_to (agent user_id)
- name
- phone (required, WhatsApp-linked)
- email
- source (website / whatsapp / portal / manual / csv)
- budget
- location
- property_type (flat / plot / villa / commercial / other)
- status (new / contacted / visit_scheduled / negotiation / closed_won / closed_lost)
- notes (text)
- created_at
- updated_at

Features:

- Add/edit/delete leads (quick modal + detail page)
- Search/filter by name/phone/status/source
- Bulk import: CSV upload (columns: name,phone,email,source,budget,location,property_type,notes) – parse with PapaParse, bulk add to Firestore
- Kanban pipeline view (drag-drop status) + list/table view toggle
- Tags: Hot/Medium/Cold (simple field or array)

### 4.3 Lead Capture

- Manual entry (form/modal)
- WhatsApp sync: Incoming message → auto-create lead (phone + message as note, source=whatsapp)
- Web forms: Auto-generated embeddable form (simple HTML snippet) → webhook/endpoint to create lead (use Firebase Functions if needed)
- CSV import

### Additional Point:

RULE-BASED LEAD SCORING SYSTEM (MVP v1)
REAL ESTATE CRM — LEAD PRIORITY ENGINE

1. PURPOSE

Automatically rank leads so agents know:

🔥 Who to call first
🟡 Who to nurture
❄️ Who to ignore (for now)

Without using AI.

2. OUTPUT

Each lead has:

lead_score: 0 – 100
lead_priority: HOT / WARM / COLD

Stored in DB.

3. WHEN TO SCORE

Score is recalculated when:

- New lead created
- Message received/sent
- Task completed
- Status changed
- Every 6 hours (cron)

4. DATABASE FIELDS (ADD TO leads)
   lead_score INT DEFAULT 0
   lead_priority VARCHAR(10)
   last_interaction_at TIMESTAMP
   visit_scheduled_at TIMESTAMP NULL

5. SCORING FACTORS

Total = 100 points max

5.1 Response Speed (Max 25 pts)
Condition Points
Replied < 1 hr +25
Replied < 6 hr +20
Replied < 24 hr +10

> 24 hr 0
> 5.2 Engagement Level (Max 20 pts)
> Condition Points
> 5+ messages +20
> 3–4 messages +15
> 1–2 messages +5
> No reply 0
> 5.3 Site Visit (Max 20 pts)
> Condition Points
> Visit scheduled +15
> Visit completed +20
> Missed visit -10
> 5.4 Budget Match (Max 15 pts)

Compare:

lead_budget vs property_price

Match % Points
≥ 90% +15
70–89% +10
50–69% +5
< 50% 0
5.5 Recency (Max 10 pts)
Last Interaction Points
< 24 hrs +10
1–3 days +5

> 3 days 0
> 5.6 Source Quality (Max 10 pts)
> Source Points
> Website +10
> WhatsApp +8
> Portal +6
> Facebook +5
> Walk-in +4
> Unknown 0 6. PENALTIES (NEGATIVE SCORING)
> Condition Points
> No reply 5 days -15
> No reply 10 days -25
> Marked lost -50
> Fake number -100

Minimum score = 0

7. FINAL SCORE CALCULATION
   score =
   response_score

- engagement_score
- visit_score
- budget_score
- recency_score
- source_score

* penalties

Clamp:

If score < 0 → 0
If score > 100 → 100

8. PRIORITY CLASSIFICATION
   Score Range Priority
   80–100 🔥 HOT
   50–79 🟡 WARM
   0–49 ❄️ COLD

### 4.4 WhatsApp Integration (Meta WhatsApp Cloud API)

- User connects their WhatsApp Business number (in-app guide: link to Meta Business Manager setup → provide access token/phone ID)
- Send: Template messages (pre-approved) + free-form (within 24h customer service window)
- Receive: Webhook endpoint → parse incoming → create/update lead + log message
- Store: messages subcollection per lead (direction: in/out, content, timestamp)
- Automation: User-configurable simple rules (e.g., on lead create → send welcome template; after 24h → follow-up; after 72h → reminder)

WhatsApp Automation
Use: Meta WhatsApp Cloud API
Required Capabilities
Send template messages
Send free-form messages
Receive webhooks
Store message logs
Automation Rules

User-configurable:

When lead created → Send welcome message
After 1 day → Follow-up
After 3 days → Reminder
After 7 days → Re-engage

Example templates:
"Hi {{name}}, thanks for interest in {{location}}. Budget? Reply here."
"Site visit tomorrow 4pm? Confirm YES/NO"

### 4.5 Reminders & Tasks

Subcollection: tasks per lead

- task_id
- lead_id
- type (call / visit / followup)
- due_date (timestamp)
- status (pending / done)
- assigned_to

Features:

- Create/set task + due date
- In-app notification panel (list due today/tomorrow)
- Push notifications (Firebase FCM)
- Auto-WhatsApp reminder option (e.g., send to agent or lead)

### 4.6 Dashboard

- Stats cards: Total leads, Hot leads, Follow-ups due today, Conversion rate (closed_won / total)
- Charts: Leads by source (pie), Status funnel (bar) – use Recharts or Chart.js
- Follow-up list (due tasks/reminders)

### 4.7 Basic AI Assistant (OpenAI or Groq)

- On lead detail: "Draft Reply" button → generate 2–3 WhatsApp replies (Hindi/English) based on lead + chat history
- Suggest next action: e.g., "Schedule visit" or "Send price negotiation"
- Prompt example: "You are a polite real estate broker assistant. Draft short WhatsApp reply..."

### 4.8 Team Management (Simple)

- Roles: owner (full access), agent (view/own assigned leads)
- Owner: Add agents (email invite), assign leads to agents

### 4.9 Billing (Razorpay)

- 7-day trial on signup
- Monthly subscription via Razorpay checkout
- Plans: Starter / Pro / Agency (stub features for now)
- Webhook for payment success → update subscription status in Firestore

### Create a guest login that doesnot require auth to acess and populate with dummy data

### Create a landing page

## 5. TECH STACK (Fixed – Firebase-Centric)

- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- State/Query: React Query or SWR
- Database & Auth: Firebase (Firestore + Authentication + FCM for push)
- Backend: Next.js API Routes + Firebase Admin SDK (for server-side ops)
- WhatsApp: Meta Cloud API (axios/fetch for send, Next.js API route for webhook)
- AI: OpenAI API (gpt-4o-mini)
- CSV Parse: PapaParse
- Charts: Recharts
- Payments: Razorpay SDK (Node.js)
- Background: Firebase Scheduled Functions

## 6. DATABASE STRUCTURE (Firestore Collections)

- users: {uid, name, email, role: 'owner'|'agent', phone, created_at, subscription: {plan, status, expires_at}}
- leads: {lead_id, user_id, assigned_to, name, phone, ...} – subcollections:
  - messages: {msg_id, direction, content, timestamp}
  - tasks: {task_id, type, due_date, status}
  - notes: {note_id, content, created_at}
- automations: per user {automation_id, trigger: 'lead_created'|'after_days', delay_hours/days, template_text, active}
- subscriptions: (optional mirror for Razorpay events)

## 7. KEY API ENDPOINTS (Next.js API Routes)

- Auth: /api/auth/\* (Firebase handles most)
- Leads: GET/POST/PUT/DELETE /api/leads, /api/leads/[id]
- CSV Import: POST /api/leads/import (multipart form)
- WhatsApp: POST /api/whatsapp/send, POST /api/whatsapp/webhook (verify + handle incoming)
- Automations: GET/POST/PUT /api/automations
- Tasks: GET/POST /api/tasks
- Dashboard data: GET /api/dashboard/stats
- Razorpay: POST /api/billing/create-order, webhook /api/billing/webhook

## 8. AUTOMATION ENGINE

- Vercel Cron (every 15 min): Query active automations + leads
- Check if trigger condition met (e.g., created_at + delay passed AND no recent contact)
- Send WhatsApp template → log message

## 9. UI SCREENS (Mobile-Responsive)

- Login/Signup
- Dashboard (stats + charts + due follow-ups)
- Leads List/Kanban
- Lead Detail (profile, messages, notes, tasks, send WhatsApp, AI draft)
- Automations (list + simple form to add rules/templates)
- Settings (WhatsApp connect guide, team add, billing)

## 10. ACCEPTANCE CRITERIA

MVP complete when agent can:

- Sign up → get 7-day trial
- Connect WhatsApp (with guide)
- Add/import leads
- Receive incoming WhatsApp → auto-lead + log
- Send manual/auto messages
- Set reminders → get notified
- View dashboard stats
- Pay via Razorpay (test mode)

## 11. NON-FUNCTIONAL

- Mobile-first UI (Tailwind responsive)
- Error handling (e.g., "WhatsApp not connected")
- Security: Firebase rules (user owns data), verify webhook signature
- notes: Templates must be pre-approved by Meta; DLT registration may be needed for bulk

Start building step-by-step. Use Firebase SDK everywhere possible. Optimize the pseudo codes in the .md file if you feel its required

Ask if any clarification is needed

After build is completed show and guide the manual setups and configs required from my end like apis setup and firebase setup etc.....

3. In messages page - Unified message dashboard for whatsapp , sms

4. Improve the landing page to a modern saas style with all features shown.
   Note: Donot change the current Hero title and subtitle
   remove the pricing table

5. in the hero section on clicking free trial a modal popup with the fields(users name , mail and phone number) and get saved in firestore
