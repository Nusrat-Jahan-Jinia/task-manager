# Task Manager Application

A full-stack task management application with Laravel backend, React frontend, and MySQL database, containerized with Docker for easy deployment.

## Table of Contents

- [Live Demo](#live-demo)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Deployment Instructions](#deployment-instructions)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

## Live Demo

A live demonstration of the application is available at:

**Demo URL**: [https://task-manager-frontend-one-mu.vercel.app](https://task-manager-frontend-one-mu.vercel.app)

**Demo Credentials**:
- Email: test@gmail.com
- Password: password123

Feel free to explore the application and its features. The demo is reset every 24 hours.

## Architecture

This application follows a modern containerized microservices architecture with four main components:

```
+-----------------------------------------------------+
|                 Docker Environment                  |
|                                                     |
|  +------------+       +-------------+               |
|  |            |       |             |               |
|  |  Browser   +------>+  Frontend   |  Port 3000    |
|  |            |       |  (React)    |               |
|  +------------+       +------+------+               |
|                              |                      |
|                              | API Calls            |
|                              v                      |
|                       +------+------+               |
|                       |             |               |
|                       |   Nginx     |  Port 9000    |
|                       |   (Proxy)   |               |
|                       +------+------+               |
|                              |                      |
|                              | FastCGI              |
|                              v                      |
|                       +------+------+               |
|                       |             |               |
|                       |  Backend    |  Port 9000    |
|                       |  (Laravel)  |               |
|                       +------+------+               |
|                              |                      |
|                              | SQL Queries          |
|                              v                      |
|                       +------+------+               |
|                       |             |               |
|                       |  Database   |  Port 3306    |
|                       |  (MySQL)    |               |
|                       +-------------+               |
|                                                     |
+-----------------------------------------------------+
```

### Components

1. **Frontend (React)**
   - Single-page application built with React
   - PWA (Progressive Web App) capabilities 
   - Tailwind CSS for styling
   - Redux for state management
   - Runs on port 3000
   - Communicates with backend via REST API

2. **Nginx (Web Server/Proxy)**
   - Serves as a reverse proxy
   - Routes API requests to the Laravel backend
   - Handles CORS and other HTTP headers
   - Exposes port 9000 for API access
   - Configured with optimized settings for production

3. **Backend (Laravel)**
   - PHP-based RESTful API
   - Laravel framework
   - JWT authentication
   - Eloquent ORM for database operations
   - Runs as PHP-FPM process

4. **Database (MySQL)**
   - MySQL 8.0
   - Persistent data storage
   - Properly configured for production
   - Available to the backend via internal docker network
   - Exposes port 3306 for external connections if needed

### Data Flow

1. **Request Flow**:
   - User accesses the frontend on port 3000
   - Frontend makes API calls to Nginx on port 9000
   - Nginx forwards requests to the backend PHP-FPM process
   - Backend processes requests and interacts with MySQL
   - Responses follow the reverse path back to the user

2. **Authentication Flow**:
   - Login/registration requests are processed by the backend
   - JWT tokens are issued upon successful authentication
   - Tokens are stored in localStorage on the frontend
   - Subsequent API requests include the token in Authorization header

## Prerequisites

- Docker Engine (20.10.x or later)
- Docker Compose (2.0.x or later)
- Git
- At least 2GB of RAM for Docker
- 2GB free disk space

## Deployment Instructions

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/Nusrat-Jahan-Jinia/task-manager
cd task-manager
```

2. **Start the application stack**

```bash
docker compose up -d
```

3. **Wait for the services to initialize**

The database needs time to initialize. You can check the status with:

```bash
docker compose ps
```

4. **Access the application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:9000/api

### Step-by-Step Deployment

1. **Clone the repository**

```bash
git clone https://github.com/your-username/task-manager.git
cd task-manager
```

2. **Configure environment variables (optional)**

The application comes with sensible defaults, but you can modify:

```bash
# For backend
cp backend/.env.example backend/.env
# Edit as needed
```

3. **Build and start the containers**

```bash
docker compose build
docker compose up -d
```

4. **Initialize the database (first run only)**

The database migrations run automatically via the docker-entrypoint.sh script.
You can verify the database initialization with:

```bash
docker compose logs backend
```

5. **Access the application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:9000/api

## Configuration

### Docker Compose

The application is configured via `docker-compose.yml`. Key configuration:

#### Backend Service

```yaml
backend:
  build: ./backend
  expose:
    - "9000"
  command: php-fpm
  volumes:
    - ./backend:/app
    - backend-vendor:/app/vendor
  environment:
    DB_CONNECTION: mysql
    DB_HOST: db
    DB_PORT: 3306
    DB_DATABASE: taskmanager
    DB_USERNAME: laravel
    DB_PASSWORD: secret
  depends_on:
    db:
      condition: service_healthy
  networks:
    - app-network
```

#### Frontend Service

```yaml
frontend:
  build: 
    context: ./frontend
    dockerfile: Dockerfile
  ports:
    - "3000:3000"
  environment:
    VITE_API_BASE_URL: "http://localhost:9000"
  depends_on:
    - nginx
  networks:
    - app-network
```

#### Database Service

```yaml
db:
  image: mysql:8.0
  volumes:
    - db-data:/var/lib/mysql
  environment:
    MYSQL_ROOT_PASSWORD: rootpassword
    MYSQL_DATABASE: taskmanager
    MYSQL_USER: laravel
    MYSQL_PASSWORD: secret
  ports:
    - "3306:3306"
```

### Environment Variables

#### Backend Environment Variables

- `DB_CONNECTION`: Database driver (mysql)
- `DB_HOST`: Database hostname (db)
- `DB_PORT`: Database port (3306)
- `DB_DATABASE`: Database name (taskmanager)
- `DB_USERNAME`: Database username (laravel)
- `DB_PASSWORD`: Database password (secret)

#### Frontend Environment Variables

- `VITE_API_BASE_URL`: Backend API URL (http://localhost:9000)

### Volumes

The application uses Docker volumes for data persistence:

- `backend-vendor`: Stores Composer dependencies
- `db-data`: Stores MySQL database files

## API Documentation

The backend provides a RESTful API for task management. For detailed API documentation, refer to the `API.md` file in the backend directory.

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in and get JWT token
- `POST /api/auth/logout` - Log out (invalidate token)

### Task Endpoints

- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task

## Development

### Local Development Setup

For local development with hot-reload capabilities:

1. Start the stack with docker-compose:

```bash
docker compose up -d
```

2. Frontend code changes will automatically trigger a rebuild
3. Backend code changes are immediately reflected due to volume mounting

### Running Tests

```bash
# Backend tests
docker compose exec backend php artisan test

# Frontend tests not incluided yet 
docker compose exec frontend npm test
```

### Accessing Container Shells

```bash
# Backend shell
docker compose exec backend sh

# Frontend shell
docker compose exec frontend sh

# Database shell
docker compose exec db mysql -u laravel -p
# When prompted, enter: secret
```

## Troubleshooting

### Common Issues

1. **Database connection errors**

   Check if the database container is running:
   ```bash
   docker compose ps db
   ```

   Verify database credentials in the docker-compose.yml and backend/.env files match.

2. **Nginx proxy errors**

   Check nginx logs:
   ```bash
   docker compose logs nginx
   ```

   Ensure the backend service is running:
   ```bash
   docker compose ps backend
   ```

3. **Frontend API connection issues**

   Verify the VITE_API_BASE_URL is set correctly in the docker-compose.yml.
   Check browser console for CORS errors.

### Viewing Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs backend

# Follow logs
docker compose logs -f
```

## Maintenance

### Backing Up Data

```bash
# Backup the database
docker compose exec db mysqldump -u laravel -psecret taskmanager > backup.sql
```

### Restoring Data

```bash
# Restore from backup
cat backup.sql | docker compose exec -T db mysql -u laravel -psecret taskmanager
```

### Updating Application

```bash
# Pull latest code
git pull

# Rebuild and restart containers
docker compose down
docker compose build
docker compose up -d

# Run any new migrations
docker compose exec backend php artisan migrate
```

### Cleaning Up

```bash
# Remove containers but keep volumes
docker compose down

# Remove containers and volumes (CAUTION: This deletes all data)
docker compose down -v
```

---

## License

[MIT License](LICENSE)

## Acknowledgements

- Laravel - The PHP Framework for Web Artisans
- React - A JavaScript library for building user interfaces
- Docker - Containerization platform
- Nginx - High-performance HTTP server
- MySQL - Open-source relational database 