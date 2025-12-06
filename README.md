# 🚀 Microservices Task Management System

A production-ready **Node.js Microservices Architecture** built with:
- Node.js + Express  
- Docker & Docker Compose  
- Independent microservices (User, Task, Notification)  
- RESTful APIs  
- Scalable folder structure  

---


## 🧩 Services Overview

### 🔹 User Service
Handles:
- User registration  
- User login  
- JWT authentication  
- Profile access  

### 🔹 Task Service
Handles:
- Create / update / delete tasks  
- Fetch tasks  
- Assign tasks to users  

### 🔹 Notification Service
Handles:
- Email / SMS notifications  
- Task activity notifications  
- Internal service-to-service communication  

---

## 🐳 Running the Project (Docker Compose)

### Start all microservices
docker-compose up --build

shell
Copy code

### Stop all services
docker-compose down

shell
Copy code

### Rebuild a single service
docker-compose build user-service

yaml
Copy code

---

## ⚙️ Environment Variables

Each service can contain its own `.env` file:

PORT=4001
MONGO_URI=mongodb://localhost:27017/userdb
JWT_SECRET=yourSecretKey

yaml
Copy code

---

## 🧪 API Endpoints

### User Service
POST /api/users/register
POST /api/users/login
GET /api/users/profile

shell
Copy code

### Task Service
POST /api/tasks
GET /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id

shell
Copy code

### Notification Service
POST /api/notify/send

yaml
Copy code

## 📜 License  
MIT License © 2025

