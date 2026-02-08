# 🚀 Asteroid Monitoring Dashboard

A full-stack web platform that tracks Near-Earth Objects (NEOs) using NASA’s live asteroid data.  
The system transforms complex trajectory data into clear risk assessments, visual alerts, and a personalized monitoring dashboard.

---

## 🌌 Overview

Thousands of asteroids pass near Earth every day, but raw space data is difficult to interpret for the general public.  
This platform provides a user-friendly interface to monitor asteroids, evaluate risk levels, and receive automated alerts for close approaches.

Users can:

- Track specific asteroids
- View real-time velocity and distance data
- See calculated risk scores
- Receive dashboard alerts
- Participate in community discussion
- Explore optional 3D visualizations

---

## 🧠 Core Features

### ✅ User Authentication
- Secure signup/login using JWT
- Password hashing and protected routes
- Personalized asteroid watchlist

### 📡 Real-Time Data Feed
- NASA NeoWs API integration
- Live asteroid tracking
- Cached responses for performance

### ⚠️ Risk Analysis Engine
- Custom risk scoring algorithm
- Categorization by size, distance, and hazard status
- Clear visual risk indicators

### 🔔 Alert & Notification System
- Scheduled checks for close approaches
- User-specific alert rules
- Dashboard notifications

### 💬 Live Community Chat
- Real-time discussion per asteroid
- Room-based chat architecture

### 🌍 3D Visualization (Bonus)
- Interactive orbital view
- Earth + asteroid motion simulation

### 🐳 Containerized Deployment
- Dockerized frontend and backend
- One-command startup using docker-compose

---

## 🏗 Tech Stack

**Frontend**
- React
- Three.js (3D visualization)
- Socket.io client

**Backend**
- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Socket.io

**Infrastructure**
- Docker
- Docker Compose

**External APIs**
- NASA NeoWs API

---
