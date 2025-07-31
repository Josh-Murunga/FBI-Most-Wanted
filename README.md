# Full-Stack FBI Wanted Web Application

## Project Overview

This application surfaces FBI Most Wanted persons with user authentication, caching, and filtering.  
It uses:

- **Frontend:** React.js with Tailwind CSS  
- **Backend:** Node.js + Express.js  
- **Database:** MySQL for persistent user storage (users, auth)  
- **Cache:** Redis for caching FBI API responses and JWT invalidation (logout)  
- **Containerization:** Docker & Docker Compose  
- **Authentication:** JWT with token blacklisting in Redis  

---

## Architecture Highlights

- Cache-aside pattern: backend checks Redis first, falls back to `https://api.fbi.gov/wanted`, then caches responses for 1 hour.  
- User data (registration / login) stored in MySQL.  
- JWTs are validated on protected routes; logout is implemented by blacklisting tokens in Redis.

## Prerequisites

- Docker  
- Docker Compose  

---

## Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/Josh-Murunga/FBI-Most-Wanted.git
   cd FBI-Most-Wanted

2. **cd into the server/ and client/ directories and rename the .env file**

   ```bash
   cd server
   mv env.example .env
   ```

   ```bash
   #from root
   cd client
   mv env.example .env

3. **Start the application using Docker Compose:**
    ```sh
    docker-compose up --build -d
    ```

4. **Access the application:**
    - Frontend: [http://localhost:3100](http://localhost:3100)
    - Backend API: [http://localhost:5100](http://localhost:5100)

---

## Environment Variables

The application uses the following environment variables (ports have been forwarded to avoid pre-existing setups. You can alter the ports to your pleasing in the [docker-compose.yml](docker-compose.yml) file). You can also set your preferred env values in the same file.

| Variable                | Description                          | Example Value                |
|-------------------------|--------------------------------------|------------------------------|
| `MYSQL_HOST`            | MySQL database host                  | `mysql`                      |
| `MYSQL_PORT`            | MySQL port                           | `3306`                       |
| `MYSQL_USER`            | MySQL username                       | `root`                       |
| `MYSQL_PASSWORD`        | MySQL password                       | `password`                   |
| `MYSQL_DATABASE`        | MySQL database name                  | `fbi_most_wanted`            |
| `REDIS_HOST`            | Redis host                           | `redis`                      |
| `REDIS_PORT`            | Redis port                           | `6379`                       |
| `JWT_SECRET`            | Secret for JWT token signing         | `your_jwt_secret`            |
| `PORT`                  | Backend server port                  | `5000`                       |
| `CLIENT_URL`            | Frontend URL (for CORS)              | `http://localhost:3000`      |

---

## Docker Compose

The root docker-compose.yml orchestrates:
 - db: mysql:8.0 for user data
 - cache: redis:alpine for caching and token blacklist
 - server: built from ./server/Dockerfile (depends on db and cache)
 - client: built from ./client/Dockerfile (depends on server)

Volumes are mounted for live edits

---

## API Endpoints

All endpoints are prefixed with `/api`. Protected routes require an Authorization: Bearer token header.

### **Authentication**
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive a JWT token
- `POST /api/auth/logout` — Logout the current user

### **User**
- `GET /api/user/profile` — Get the authenticated user's profile

### **Most Wanted Profiles**
- `GET /api/wanted` — Get a list of most wanted profiles (supports query params for search/filter)
- `GET /api/wanted/:id` — Get details for a specific wanted profile

---

## Notes

- **Redis** is used for caching most wanted profiles and search queries to improve performance.
- **MySQL** is used for persistent storage of user accounts and profile data.
- All services are orchestrated using Docker Compose for easy local development and deployment.
- Code changes in ./server and ./client reflect immediately due to volume mounts.