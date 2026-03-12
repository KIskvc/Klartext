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

### Running locally (without Docker)

You need three things running: a PostgreSQL database, the backend, and the frontend.
Open three separate terminal windows.

#### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/)
- PostgreSQL — see options below

---

#### Step 1 — Start PostgreSQL

**Option A: Docker for the database only (no PostgreSQL installation needed)**

If you have Docker Desktop, just spin up the database container and leave the rest local:

```bash
cd personal-finance-manager
docker compose up postgres -d
```

The database is now reachable on `localhost:5432`. Skip to Step 2.

---

**Option B: Install PostgreSQL locally**

Install PostgreSQL 17:

```bash
# Windows
winget install PostgreSQL.PostgreSQL

# macOS
brew install postgresql@17
brew services start postgresql@17
```

During the Windows installer, set a password for the `postgres` superuser when prompted — you will need it in the next step.

**Create the database and user:**

Open a SQL shell. On Windows, search for **"SQL Shell (psql)"** in the Start menu. On macOS/Linux, run `psql -U postgres` in a terminal. When asked for a password, enter the one you set during installation.

Once inside the psql prompt, run:

```sql
CREATE USER pfm_user WITH PASSWORD 'pfm_password';
CREATE DATABASE personal_finance OWNER pfm_user;
\q
```

Verify the connection string in `appsettings.Development.json` matches your setup — by default it expects `Host=localhost;Port=5432;Database=personal_finance;Username=pfm_user;Password=pfm_password`.

---

#### Inspecting the database with psql

**When using Docker (`docker compose up postgres -d`):**

Connect to the running container's psql shell:

```bash
docker exec -it personal-finance-manager-postgres-1 psql -U pfm_user -d personal_finance
```

> The container name may vary. Run `docker ps` to confirm the exact name.

**When using a local PostgreSQL installation:**

On Windows, open **SQL Shell (psql)** from the Start menu and press Enter through the prompts (server, database, port, username), then enter your password.
On macOS/Linux, run:

```bash
psql -U pfm_user -d personal_finance
```

**Useful psql commands:**

```sql
-- List all tables
\dt

-- Inspect table contents
SELECT * FROM "Categories";
SELECT * FROM "Transactions";
SELECT * FROM "Budgets";

-- Count rows
SELECT COUNT(*) FROM "Transactions";

-- Exit
\q
```

> Table names are quoted because EF Core creates them with an uppercase first letter. Without quotes, PostgreSQL lowercases identifiers and the query will fail.

---

#### Step 2 — Start the backend

```bash
cd personal-finance-manager/backend/PersonalFinanceManager.Api
dotnet run
```

The API starts at `http://localhost:5068`.
Scalar UI: `http://localhost:5068/scalar/v1`

> On first run, `Database:RecreateOnStartup=true` (set in `appsettings.Development.json`) will automatically create all tables. No manual migration needed.

---

#### Step 3 — Start the frontend

```bash
cd personal-finance-manager/frontend/personal-finance-manager-ui
npm install        # first time only
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

