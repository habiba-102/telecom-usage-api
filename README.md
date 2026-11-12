# Telecom Usage & Subscription API

A REST API for managing telecom plans, customers, subscriptions and usage tracking.
Built with **Node.js, Express.js, MongoDB and Mongoose** (ES modules).

## Features

- CRUD for **plans** and **customers** with Mongoose schema validation (required, min/max, enum, regex, unique).
- **Subscriptions**: a customer subscribes to a plan and receives a balance (data, minutes, SMS) copied from the plan. A customer can have only one active subscription at a time.
- **Usage tracking**: each usage record is deducted from the balance with a single atomic conditional update (`findOneAndUpdate` + `$inc`), so the balance can never go below zero, even with parallel requests.
- **Monthly usage summary** built with a MongoDB aggregation pipeline (`$match`, `$group`, `$project`, `$sort`).
- **Optimistic concurrency** on plans and customers (`optimisticConcurrency: true`).
- Mongoose **virtuals** (`pricePerDay`), **references + populate**, **timestamps** and an index on usage records.
- Filtering and pagination with query parameters.
- Centralized error handling (validation, cast, duplicate key and version errors) and 404 handling.

## Project structure

```
index.js
src/
  config/db.js
  models/        plan, customer, subscription, usage
  controllers/   plan, customer, subscription, usage
  routes/        plan, customer, subscription
  middlewares/   errorHandler, notFound
  utils/         AppError, asyncHandler
```

## Getting started

```bash
npm install
cp .env.example .env     # set MONGO_URI if needed
npm run dev
```

Requires Node.js 18+ and a running MongoDB instance.

## API endpoints

### Plans
| Method | Route | Description |
|---|---|---|
| POST | `/api/plans` | Create a plan |
| GET | `/api/plans?isActive=true&maxPrice=200&page=1&limit=10` | List plans |
| GET | `/api/plans/:id` | Get a plan |
| PATCH | `/api/plans/:id` | Update a plan |
| DELETE | `/api/plans/:id` | Delete a plan |

### Customers
| Method | Route | Description |
|---|---|---|
| POST | `/api/customers` | Create a customer |
| GET | `/api/customers?status=active&page=1&limit=10` | List customers |
| GET | `/api/customers/:id` | Get a customer |
| PATCH | `/api/customers/:id` | Update a customer |
| DELETE | `/api/customers/:id` | Delete a customer |

### Subscriptions & usage
| Method | Route | Description |
|---|---|---|
| POST | `/api/subscriptions` | Subscribe (`{ "customerId", "planId" }`) |
| GET | `/api/subscriptions?customer=<id>&status=active` | List subscriptions |
| GET | `/api/subscriptions/:id` | Get a subscription (populated) |
| PATCH | `/api/subscriptions/:id/cancel` | Cancel a subscription |
| POST | `/api/subscriptions/:id/usage` | Record usage (`{ "type": "dataMB", "amount": 500 }`) |
| GET | `/api/subscriptions/:id/usage?type=dataMB` | List usage records |
| GET | `/api/subscriptions/:id/usage/summary?month=2026-11` | Monthly usage summary |

`type` is one of `dataMB`, `minutes`, `sms`.

## Example flow

```bash
# 1. Create a plan
curl -X POST localhost:3000/api/plans -H "Content-Type: application/json" \
  -d '{"name":"Flex 100","price":100,"dataMB":5000,"minutes":300,"sms":100,"validityDays":30}'

# 2. Create a customer
curl -X POST localhost:3000/api/customers -H "Content-Type: application/json" \
  -d '{"name":"Habiba Ahmed","phone":"01012345678","email":"habiba@example.com"}'

# 3. Subscribe
curl -X POST localhost:3000/api/subscriptions -H "Content-Type: application/json" \
  -d '{"customerId":"<customer_id>","planId":"<plan_id>"}'

# 4. Record usage
curl -X POST localhost:3000/api/subscriptions/<subscription_id>/usage \
  -H "Content-Type: application/json" -d '{"type":"dataMB","amount":500}'

# 5. Monthly summary
curl "localhost:3000/api/subscriptions/<subscription_id>/usage/summary?month=2026-11"
```

## Possible improvements

JWT authentication with roles, automated tests, Docker support and CI.
