# Trimflow - Professional Barber Shop Management System

> A complete, production-ready management system for barbershops and salons. Built with React, Spring Boot, and MariaDB.

[![License](https://img.shields.io/badge/license-Commercial-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2.6-61DAFB.svg)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.6-6DB33F.svg)](https://spring.io/projects/spring-boot)
[![MariaDB](https://img.shields.io/badge/MariaDB-10.4+-003545.svg)](https://mariadb.org)

---

## ✨ Features

### 🎯 Core Functionality
- **👥 Customer Management**: Add, edit, and manage client profiles with contact info and notes
- **✂️ Service Catalog**: Create and manage services with pricing, duration, and descriptions
- **📅 Appointment Booking**: Intuitive calendar interface for scheduling appointments
- **👨‍🦱 Barber Management**: Manage your team with specializations and availability
- **🕐 Working Hours**: Flexible schedule configuration per day of the week
- **🔐 Authentication**: Secure JWT-based login system with role-based access

### 🎨 User Experience
- **🌙 Modern UI**: Clean, responsive design built with Tailwind CSS
- **🌍 Multi-language**: i18n support for internationalization
- **📱 Mobile-First**: Fully responsive layout that works on any device
- **⚡ Fast Navigation**: Client-side routing with React Router for instant page loads

### 🔧 Developer Experience
- **📦 Docker Ready**: Optional `docker-compose.yml` for one-command deployment
- **🔧 Hot Reload**: Development servers with live reloading for both frontend and backend
- **🧪 Clean Architecture**: Well-structured codebase following best practices
- **📝 API Documentation**: Swagger/OpenAPI docs at `/swagger-ui.html`

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.6 | UI library |
| Vite | 8.x | Build tool & dev server |
| Tailwind CSS | 4.3.0 | Utility-first styling |
| React Router | 7.15.0 | Client-side routing |
| Axios | 1.16.1 | HTTP client |
| i18next | 26.1.0 | Internationalization |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Spring Boot | 4.0.6 | Application framework |
| Spring Security | - | Authentication & authorization |
| Spring Data JPA | - | Database abstraction |
| MariaDB | 10.4+ | Relational database |
| Flyway | - | Database migrations |
| Lombok | - | Boilerplate reduction |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker & Docker Compose | Containerization & orchestration |
| Maven | Backend build & dependency management |
| npm/yarn | Frontend package management |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **Java JDK** >= 21 ([Download](https://adoptium.net/))
- **MariaDB** >= 10.4 ([Download](https://mariadb.org/download/))
- **Maven** >= 3.8 ([Download](https://maven.apache.org/))

> 💡 **Tip**: Use `nvm` for Node.js version management and `sdkman` for Java/Maven management.

---

## 🚀 Quick Start

### Option 1: Docker (Recommended for Production)

```bash
# Clone the repository
git clone https://github.com/yourusername/Trimflow.git
cd Trimflow

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit environment variables (optional)
nano backend/.env

# Start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8081
# Swagger Docs: http://localhost:8081/swagger-ui.html
```

### Option 2: Manual Setup (Recommended for Development)

#### 1. Database Setup

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE Trimflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run Flyway migrations (optional - auto-run on first backend start)
cd backend
mvn flyway:migrate
```

#### 2. Backend Configuration

```bash
cd backend

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Build and run
mvn clean package
mvn spring-boot:run
```

#### 3. Frontend Configuration

```bash
cd frontend

# Copy and configure environment variables
cp .env.example .env
# Edit VITE_API_BASE_URL if your backend runs on a different port

# Install dependencies and start dev server
npm install
npm run dev
```

#### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8081`
- **API Documentation**: `http://localhost:8081/swagger-ui.html`

---

## ⚙️ Configuration

### Environment Variables

#### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `8081` | Backend server port |
| `DB_URL` | `jdbc:mariadb://127.0.0.1:3306/Trimflow` | Database connection URL |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | *(empty)* | Database password |
| `DB_DDL_AUTO` | `update` | Hibernate schema strategy (`update`/`validate`/`none`) |
| `JWT_SECRET` | *required* | **Critical**: JWT signing key (min. 32 characters) |
| `JWT_EXPIRATION_MS` | `86400000` | JWT token expiration (ms) - default: 24h |
| `LOG_LEVEL_ROOT` | `INFO` | Root logging level |
| `LOG_LEVEL_APP` | `DEBUG` | Application logging level |

> ⚠️ **Security Warning**: Always generate a strong, unique `JWT_SECRET` for production:
> ```bash
> # Generate a secure random key
> openssl rand -base64 32
> ```

#### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8081` | Backend API base URL |
| `VITE_ENABLE_DEBUG` | `false` | Enable debug logging in browser |

---


---

## 🔌 API Endpoints Overview

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/login` | User login | ❌ |
| `POST` | `/api/auth/register` | User registration | ❌ |

### Services
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/services` | List all services | ✅ |
| `POST` | `/api/services` | Create new service | ✅ |
| `PUT` | `/api/services/{id}` | Update service | ✅ |
| `DELETE` | `/api/services/{id}` | Delete service | ✅ |

### Customers
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/customers` | List customers | ✅ |
| `POST` | `/api/customers` | Create customer | ✅ |
| `PUT` | `/api/customers/{id}` | Update customer | ✅ |
| `DELETE` | `/api/customers/{id}` | Delete customer | ✅ |

### Bookings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/bookings` | List appointments | ✅ |
| `POST` | `/api/bookings` | Create appointment | ✅ |
| `PUT` | `/api/bookings/{id}` | Update appointment | ✅ |
| `DELETE` | `/api/bookings/{id}` | Cancel appointment | ✅ |

### Schedule
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/schedule` | Get working hours | ✅ |
| `POST` | `/api/schedule` | Set working hours | ✅ |
| `DELETE` | `/api/schedule/{day}` | Remove day schedule | ✅ |

> ✅ = Requires valid JWT token in `Authorization: Bearer <token>` header

---

## 🔐 Security Best Practices

### For Production Deployment

1. **JWT Secret**: Always use a cryptographically secure random string (min. 32 chars)
2. **Database Credentials**: Never use default passwords; rotate credentials regularly
3. **CORS Configuration**: Restrict `AllowedOrigins` to your production domain(s)
4. **HTTPS**: Always serve the application over HTTPS in production
5. **Rate Limiting**: Consider adding rate limiting to authentication endpoints
6. **Logging**: Set `LOG_LEVEL_ROOT=INFO` and `LOG_LEVEL_APP=INFO` in production

### Environment-Specific Configuration

Create separate configuration files for different environments:

```properties
# application-prod.properties example
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
logging.level.root=INFO
logging.level.com.Trimflow=INFO
```

Activate with: `--spring.profiles.active=prod`

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
mvn test                    # Run unit tests
mvn test -Dtest=ServiceControllerTest  # Run specific test
mvn jacoco:report          # Generate code coverage report
```

### Frontend Tests

```bash
cd frontend
npm run test               # Run Vitest tests
npm run test:coverage      # Generate coverage report
npm run lint              # Run ESLint checks
```

---

## 🐳 Docker Deployment

### Build Images

```bash
# Build backend image
cd backend
docker build -t Trimflow-backend:latest .

# Build frontend image
cd ../frontend
docker build -t Trimflow-frontend:latest .
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (resets database)
docker-compose down -v
```

### docker-compose.yml Overview

```yaml
services:
  db:
    image: mariadb:10.11
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_PASSWORD}
      MARIADB_DATABASE: Trimflow
    volumes:
      - db_data:/var/lib/mysql
  
  backend:
    build: ./backend
    ports:
      - "8081:8081"
    environment:
      - DB_URL=jdbc:mariadb://db:3306/Trimflow
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
  
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=http://localhost:8081

volumes:
  db_data:
```

---

## 🔄 Updating Trimflow

### From Source

```bash
# Pull latest changes
git pull origin main

# Update backend
cd backend
mvn clean install

# Update frontend
cd ../frontend
npm install

# Restart services
# (Docker: docker-compose up -d --build)
# (Manual: restart both dev servers)
```

### Database Migrations

Flyway automatically applies new migrations on startup. To manually check migration status:

```bash
cd backend
mvn flyway:info
```

---

## 🤝 Contributing

Trimflow is a commercial product. However, we welcome:

- 🐛 **Bug Reports**: Open an issue with steps to reproduce
- 💡 **Feature Requests**: Describe your use case and desired functionality
- 📝 **Documentation Improvements**: PRs for clearer docs are always appreciated

### Reporting Issues

When reporting a bug, please include:
1. Trimflow version
2. Environment details (OS, Node/Java versions)
3. Steps to reproduce the issue
4. Expected vs. actual behavior
5. Relevant logs or screenshots

---

## 📄 License

Trimflow is distributed under a **Commercial License**.

### ✅ You May:
- Use Trimflow for your own business or client projects
- Modify the source code for your specific needs
- Deploy to unlimited locations under a single license

### ❌ You May Not:
- Resell or redistribute the source code as your own product
- Remove copyright notices or license information
- Use the code to create a competing SaaS product

### 🔄 License Tiers

| Tier | Price | Includes |
|------|-------|----------|
| **Starter** | $49 | Source code + documentation |
| **Professional** | $99 | Starter + 6 months updates + email support |
| **Agency** | $199 | Professional + unlimited projects + priority support |

> For custom licensing or enterprise inquiries, contact: **support@Trimflow.dev**

---

## 🆘 Support

### Documentation
- 📘 [Getting Started Guide](./docs/GETTING_STARTED.md)
- 🔌 [API Reference](./docs/API_REFERENCE.md)
- 🔧 [Deployment Guide](./docs/DEPLOYMENT.md)

### Getting Help

1. **Check the logs**: Most issues are logged with helpful error messages
2. **Review this README**: Common setup issues are documented here
3. **Search existing issues**: Your question may already be answered

### Contact Support

| Channel | Response Time | Availability |
|---------|--------------|--------------|
| 📧 Email | 24-48 hours | Professional+ licenses |
| 💬 Discord | Community | All users |
| 🎫 Priority Ticket | 4-8 hours | Agency license |

📧 **Email**: support@Trimflow.dev  
💬 **Discord**: [Join our community](https://discord.gg/Trimflow) *(coming soon)*

---

## 🙏 Acknowledgments

Trimflow is built with love using these amazing open-source projects:

- [React](https://react.dev) - A JavaScript library for building user interfaces
- [Spring Boot](https://spring.io/projects/spring-boot) - Production-ready framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [MariaDB](https://mariadb.org) - Enterprise-grade open-source database
- [Vite](https://vitejs.dev) - Next-generation frontend tooling

---

## 📈 Roadmap

Planned features for upcoming releases:

- [ ] 📊 Analytics dashboard with booking statistics
- [ ] 🔔 SMS/Email notifications for appointments
- [ ] 💳 Payment integration (Stripe, PayPal)
- [ ] 📱 Progressive Web App (PWA) support
- [ ] 👥 Multi-barber location management
- [ ] 🌐 Admin portal for multi-tenant deployments

*Have a feature idea? Let us know!*

---

> **Trimflow** — Streamline your barbershop operations. Focus on your craft, we'll handle the rest. ✂️🚀

*Made with ❤️ for barbers, by developers who understand your business.*