# Server

Minimal Express server.

## Scripts

- `npm start` — run server on port 3000
- `npm run dev` — run with nodemon (auto-restart)

## Run

```bash
npm install
npm run dev
# open http://localhost:3000
# health check: http://localhost:3000/health
```

## Configure

Create `.env` (optional):
```
PORT=4000
```

### PostgreSQL setup

1) Copy env example to `.env` and adjust:
```
# Server
PORT=3000

# PostgreSQL
PGHOST=localhost
PGPORT=5432
PGDATABASE=brainsteam
PGUSER=postgres
PGPASSWORD=postgres
# set PGSSLMODE=require for cloud providers (ssl on)
PGSSLMODE=disable
```

2) Create schema:
```bash
# example using psql
psql "postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE" -f db/schema.sql
```

3) Health check also verifies DB connectivity:
```
GET /health → { status: 'ok', db: 'up' | 'down' }
```

### TypeORM

- Config in `db/data-source.js` uses env `PG*` and `synchronize=true` for dev.
- Entities (EntitySchema): `Channel`, `Staff`, `Campaign`, `Lead`, `Student`, `Form` under `db/entities/`.
- On startup the app initializes the DataSource and seeds basic `channels`, `staff`, `campaigns` if empty.
- Channels API now reads from PostgreSQL via TypeORM repositories.

#### Migrations (recommend for all environments)

- Generate from current entities (compare to DB):
```bash
npm run db:migrate:generate
```
- Create an empty migration (manual editing):
```bash
npm run db:migrate:create
```
- Run migrations:
```bash
npm run db:migrate:run
```
- Revert last migration:
```bash
npm run db:migrate:revert
```

Note: `synchronize` is disabled; server runs `runMigrations()` at startup.

## API Endpoints

- GET `/` → hello message
- GET `/health` → `{ status: 'ok' }`
- Users (in-memory):
  - GET `/api/users` → list users
  - POST `/api/users` → create user `{ name }`
  - GET `/api/users/:id` → get user by id
  - PUT `/api/users/:id` → update user `{ name }`
  - DELETE `/api/users/:id` → delete user

- Leads:
  - GET `/api/leads` query: `page,size,search,status,interestLevel,campaignId,channelId,assignedStaffId,tags,sortBy,sortDirection`
    - returns `{ page,size,totalItems,totalPages,items:[enrichedLead] }`
  - GET `/api/leads/summary` → `{ total, byStatus, byChannel, byCampaign }`
  - GET `/api/leads/:id`
  - POST `/api/leads`
  - PUT `/api/leads/:id`
  - DELETE `/api/leads/:id`
  - POST `/api/leads/:id/convert` → convert to student and update lead status

- Campaigns:
  - GET `/api/campaigns` query: `page,size,search,name,status,channel,channelId,sortBy,sortDirection`
    - returns `{ page,size,totalItems,totalPages,items:[enrichedCampaign] }`
  - GET `/api/campaigns/summary` → `{ total, byStatus, byChannel, avgRoi }`
  - GET `/api/campaigns/:id`
  - GET `/api/campaigns/:id/metrics` → leadsCount, studentsCount, revenue, conversionRate, roi
  - POST `/api/campaigns`
  - PUT `/api/campaigns/:id`
  - DELETE `/api/campaigns/:id`

- Channels:
  - GET `/api/channels` query: `page,size,search,type,status,month,startMonth,endMonth,sortBy,sortDirection`
  - GET `/api/channels/summary` → `{ total, byType, byStatus }`
  - GET `/api/channels/:id`
  - GET `/api/channels/:id/campaigns` query: `page,size,sortBy,sortDirection`

- Staff:
  - GET `/api/staff` query: `page,size,search,role,status,department,campaignId,sortBy,sortDirection`
  - GET `/api/staff/summary` → `{ total, byRole, byDepartment, totalLeads, totalCampaignsOwned }`
  - GET `/api/staff/:id`
  - POST `/api/staff`
  - PUT `/api/staff/:id`
  - DELETE `/api/staff/:id`
  - POST `/api/staff/:id/assign-campaigns` body: `{ campaignIds: number[] }`

- Students:
  - GET `/api/students` query: `page,size,search,status,enrollmentStatus,campaignId,channelId,assignedStaffId,newStudent,sortBy,sortDirection`
  - GET `/api/students/summary` → `{ total, byStatus, byEnrollment, byCampaign }`
  - GET `/api/students/:id`
  - POST `/api/students`
  - PUT `/api/students/:id`
  - DELETE `/api/students/:id`

- Forms:
  - GET `/api/forms` query: `page,size,search,status,sortBy,sortDirection`
  - GET `/api/forms/:id`
  - GET `/api/forms/:id/embed` → `{ id, name, embedCode }`
  - POST `/api/forms`
  - PUT `/api/forms/:id`
  - DELETE `/api/forms/:id`

Middleware:
- CORS enabled for all origins (adjust via custom config if needed)
- Logging via `morgan` in `dev` format

## Postman

- Import collection: `postman/Brainsteam API.postman_collection.json` (chỉ cần 1 file này!)
- Collection đã có sẵn `baseUrl = http://localhost:3000` (có thể chỉnh trong collection variables nếu cần)
- Start server (`npm run dev`) rồi chạy requests

