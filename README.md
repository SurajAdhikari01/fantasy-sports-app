🎨 Fantasy Tournament SaaS - Frontend

This is the frontend of the Fantasy Tournament SaaS platform, built to provide an engaging and intuitive user experience for tournament organizers and participants.

It connects with the Fantasy Tournament SaaS Backend
 and allows users to host, join, and play fantasy leagues for cricket, football, and other sports.

🧠 What is This?

A plug-and-play fantasy sports frontend for organizers & users
Tournament organizers can manage tournaments, and users can create their fantasy teams, track scores, and compete—all in one simple UI.

🎯 Key Features
👥 Authentication & Access

Secure login/signup with JWT integration

Role-based UI (admin, user)

Persistent sessions with refresh tokens

🏟️ Tournament Management (Admin)

Create & manage tournaments

Set deadlines, budget rules, and player constraints

Control visibility and lock deadlines

🧑‍🤝‍🧑 Players

Add/update players with price, role, and team

Filter/search by role/team

Display player lists with stats

🧩 Team Creation (User)

Pick players under budget constraints

Validate team size, uniqueness, and rules

Single team per tournament per user

Lock edits after deadlines

📊 Dashboard & Tracking

Live leaderboard

User team view with performance breakdown

Tournament stats & standings

🛠 Tech Stack
Layer	Technology
Language	JavaScript (ES6)
Framework	React.js + Vite
State Mgmt	Redux Toolkit
Styling	Tailwind CSS
Routing	React Router
API Calls	Axios
Auth	JWT (via backend)
⚙️ Project Structure
frontend/
├── src/
│   ├── api/            # Axios API services
│   ├── assets/         # Images, icons
│   ├── components/     # Shared components
│   ├── pages/          # Page-level views
│   ├── store/          # Redux slices
│   ├── utils/          # Helper functions
│   └── App.jsx         # Main app entry
├── public/
├── package.json
└── vite.config.js

🚀 Getting Started

Clone the Repository

git clone https://github.com/Sanket2060/fantasy-saas-frontend
cd fantasy-saas-frontend


Install Dependencies

npm install


Set Up Environment Variables
Create a .env file in the root directory:

VITE_API_URL=http://localhost:9005   # Backend API


Start the Development Server

npm run dev


Frontend will run on http://localhost:5173

🔗 Backend Repository

👉 Fantasy Tournament SaaS - Backend

📌 Notes

Ensure the backend server is running before starting the frontend.

Update VITE_API_URL if deploying to production.
