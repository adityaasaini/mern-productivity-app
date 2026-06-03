# MERN Productivity App

A modern full-stack productivity and task management application built using the MERN stack (MongoDB, Express.js, React, Node.js). The application helps users manage tasks efficiently with a clean and responsive user interface.

## Features

- User Authentication (JWT)
- Secure Password Hashing (bcrypt)
- Task Management
- Create, Update, Delete Tasks
- MongoDB Database Integration
- Responsive React Frontend
- Modern UI with Tailwind CSS
- REST API Architecture
- Environment Variable Configuration
- AI Integration using Google Gemini API

## Tech Stack

### Frontend
- React
- Vite
- React Router DOM
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- dotenv
- cookie-parser

## Project Structure

```bash
mern-productivity-app/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── index.js
│   └── package.json
│
└── README.md
```

## Installation

### Clone Repository

```bash
git clone https://github.com/adityaasaini/mern-productivity-app.git
cd mern-productivity-app
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Run Backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Tasks

```http
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

## Environment Variables

Backend requires:

```env
PORT=
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
```

## Screenshots

Add project screenshots here.

## Future Improvements

- Task Categories
- Due Date Reminders
- Email Notifications
- Team Collaboration
- Dark Mode
- Analytics Dashboard

## Author

Aditya Saini

GitHub:
https://github.com/adityaasaini

## License

This project is licensed under the MIT License.
