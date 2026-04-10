# Premium Omni-Agent Transformation TODO

## Approved Plan Summary
- Backend: Refactor to MVC (Routes/Controllers), add /api/ai endpoint with Gemini/OpenAI integration (AI accesses DB tasks).
- Frontend: Premium UI with Tailwind CSS + Dark Glassmorphism theme. Real agent logic via AI API.
- Features: Chat UI, personalization, suggestions, analytics, animations, auth retained.

## Step-by-Step Implementation (Execute Sequentially)

### Backend Steps (1-6)
1. ✅ [AI] Read backend files (index.js, models/Task.js, models/User.js, db.js).
2. Install deps: `cd backend && npm i express cors dotenv mongoose jsonwebtoken bcryptjs google-generativeai` (or openai).
3. Refactor index.js to MVC: Create backend/routes/, backend/controllers/.
4. Add /api/ai POST route (controller uses Gemini/OpenAI, queries tasks via user token).
5. Update existing routes for tasks/users (auth middleware).
6. Test backend: `cd backend && nodemon index.js`.

### Frontend Steps (7-15)
7. ✅ [AI] Tailwind setup: `cd frontend && npm i -D tailwindcss postcss autoprefixer; npx tailwindcss init -p`.
8. Update styles: Replace CSS with Tailwind + glassmorphism (bg-gradient, backdrop-blur).
9. Add React Context (ChatContext.jsx) for state.
10. Refactor App.jsx: New Chat routes/components.
11. Create new components: Chat.jsx, MessageBubble.jsx, etc.
12. Adapt Navbar/Login/SignUp with Tailwind.
13. Integrate AI: Chat input → /api/ai fetch → stream/display responses.
14. Add features: Personalization modal, suggestions, analytics (Tailwind cards/charts).
15. Archive old todo components.

### Testing/Completion (16)
16. Full test: Auth → Chat → AI responses w/ tasks → Responsive.

Progress: 7/16 complete (Backend MVC controllers/routes/middleware; Frontend Tailwind setup/config/CSS updated). Next: Backend index.js refactor, new chat components.

