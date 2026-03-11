# Personal Finance Manager

A full-stack personal finance web application for tracking income, expenses, and monthly budgets. Built with Angular 19 and ASP.NET Core 10, with a clean Apple-inspired UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 19 (standalone components, signals) |
| Backend | ASP.NET Core 10 (REST API) |
| Database | PostgreSQL 17 |
| ORM | Entity Framework Core 10 |
| API Docs | Scalar (OpenAPI 3.x) |
| Container | Docker + Docker Compose |

---

## Quick Start

### With Docker (recommended — one command)

> Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
cd personal-finance-manager
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:5068 |
| Scalar API Docs | http://localhost:5068/scalar/v1 |
| OpenAPI JSON | http://localhost:5068/openapi/v1.json |

> **Note:** `Database:RecreateOnStartup=true` is set in docker-compose, so the database is wiped and recreated on every `docker compose up`. Disable by removing that environment variable.

---

### Without Docker (manual setup)

#### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/)
- [PostgreSQL 17](https://www.postgresql.org/download/)

#### 1. Start PostgreSQL

Create a database and user matching the connection string:

```sql
CREATE USER pfm_user WITH PASSWORD 'pfm_password';
CREATE DATABASE personal_finance OWNER pfm_user;
```

Or start only the database container:

```bash
cd personal-finance-manager
docker compose up postgres -d
```

#### 2. Start the Backend

```bash
cd personal-finance-manager/backend/PersonalFinanceManager.Api
dotnet run
```

The API starts at `https://localhost:7xxx` / `http://localhost:5068`.
Scalar UI is available at `http://localhost:5068/scalar/v1` (Development only).

#### 3. Start the Frontend

```bash
cd personal-finance-manager/frontend/personal-finance-manager-ui
npm install
npm start
```

The Angular dev server starts at `http://localhost:4200`.

---

## API Endpoints

### Categories

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | List all categories |
| `GET` | `/api/categories/{id}` | Get category by ID |
| `POST` | `/api/categories` | Create category |
| `PUT` | `/api/categories/{id}` | Update category |
| `DELETE` | `/api/categories/{id}` | Delete category |

**Category type:** `"Income"` or `"Expense"`

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/transactions` | List transactions (optional `?year=&month=` filter) |
| `GET` | `/api/transactions/{id}` | Get transaction by ID |
| `POST` | `/api/transactions` | Create transaction |
| `PUT` | `/api/transactions/{id}` | Update transaction |
| `DELETE` | `/api/transactions/{id}` | Delete transaction |

### Budgets

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/budgets` | List budgets (optional `?year=&month=` filter) |
| `PUT` | `/api/budgets` | Set budget — creates or updates (upsert) |
| `DELETE` | `/api/budgets/{id}` | Delete budget |

### Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/summary?year=&month=` | Monthly financial summary (required params) |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Database connectivity health check |

> Sample requests for all endpoints: [`personal-finance-manager/requests.http`](personal-finance-manager/requests.http)
> Import into VS Code (REST Client extension), Visual Studio, JetBrains IDEs, or Scalar.

---

## Architecture

```
personal-finance-manager/
├── backend/
│   └── PersonalFinanceManager.Api/
│       ├── Controllers/        # HTTP layer — thin, delegates to services
│       ├── Services/           # Business logic (interface + implementation)
│       ├── DTOs/               # Request/response shapes (no domain models in API)
│       ├── Models/             # EF Core entities
│       ├── Data/               # AppDbContext, EF configuration
│       └── Migrations/         # EF Core migrations
└── frontend/
    └── personal-finance-manager-ui/
        └── src/app/
            ├── pages/          # Route-level components (summary, transactions, categories, budgets)
            ├── components/     # Reusable UI (custom-select, date-picker, month-selector, toast)
            ├── services/       # HTTP clients (one per resource)
            └── models/         # TypeScript interfaces matching DTOs
```

### Layer responsibilities

**Backend**
- Controllers validate input and map HTTP status codes. No business logic.
- Services own all business rules, EF queries, and data mapping to DTOs.
- DTOs are separate from EF entities — API shape is independent of the database schema.

**Frontend**
- Pages are signal-based standalone components with local state.
- Services are thin HTTP wrappers returning `Observable<T>`.
- No global state library — component-level signals are sufficient for this scope.
- Custom design system (no Angular Material) — all components from scratch.

