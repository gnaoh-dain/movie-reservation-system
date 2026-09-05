# Movie Reservation System

A movie ticket booking system. Requirement: https://roadmap.sh/projects/movie-reservation-system

Stack: TypeScript (run directly via tsx, CommonJS) · Express 5 · Prisma 7 + PostgreSQL · JWT · Zod

## Getting started

```bash
pnpm install
cp .env.example .env      # defaults match docker-compose
docker compose up -d      # PostgreSQL 17 (5433) + Redis 7 (6379)
pnpm db:migrate           # create the schema
pnpm db:seed              # 10 movies to play with
pnpm dev                  # http://localhost:4000
```

Check: `curl localhost:4000/health` → `{"ok":true}`

## Scripts

| Command            | What it does                            |
| ------------------ | --------------------------------------- |
| `pnpm dev`         | run in dev mode with reload (tsx watch) |
| `pnpm start`       | run with tsx (no build step)            |
| `pnpm typecheck`   | type-check with tsc                     |
| `pnpm db:migrate`  | create and apply migrations             |
| `pnpm db:seed`     | seed genres + 10 movies                 |
| `pnpm db:reset`    | drop, re-migrate and re-seed            |
| `pnpm db:generate` | regenerate Prisma Client                |
| `pnpm db:studio`   | open Prisma Studio                      |

## Layout

```
|── src/
|  ├── server.ts              connect Redis, then listen
|  ├── app.ts                 express: logger → json → /api routes → error handler
|  ├── configs/               things wired once at startup
|  │   ├── env.ts             environment variables validated with zod
|  │   ├── db.ts              PrismaClient + pg adapter
|  │   ├── logger.ts          morgan
|  │   └── redis.ts           Redis client
|  ├── constants/             shared literals (see below)
|  ├── middlewares/
|  │   ├── auth.middleware.ts requireAuth → req.user
|  │   └── error.ts           the last app.use(), maps errors to JSON
|  ├── routes/
|  │   ├── index.ts           mounts every feature router under /api
|  │   ├── auth.route.ts      register, login
|  │   └── movie.route.ts     movies
|  ├── utils/
|  │   ├── jwt.ts             signToken / verifyToken
|  │   └── hash.ts            bcrypt hash / compare
|  ├── types/express.d.ts     Request.user typing
|  └── generated/prisma/      Prisma Client (gitignored)

|── uploads/                  file upload
|── prisma/
|  ├── schema.prisma          data model
|  ├── migrations/            generated SQL migrations
|  └── seed.ts                genres + 10 movies
|── prisma.config.ts          datasource URL + seed command (Prisma 7 ignores url in the schema)
|── docker-compose.yml        PostgreSQL 5433, Redis 6379

```

### Where constants go

Keep a constant next to the only file that uses it — a `const TOKEN_TTL = '7d'` at the top of
`utils/jwt.ts` needs no home of its own. Move it to `src/constants/` **only once a second module
imports it**, one file per topic (`auth.constants.ts`, `reservation.constants.ts`) re-exported
from `src/constants/index.ts`.

Values that change per environment (secrets, URLs, ports) are not constants — they belong in
`.env` and `configs/env.ts`, so they get validated at startup.

## Data model

`User` (role USER/ADMIN) · `Genre` → `Movie` → `Showtime` (belongs to a `Theater`, has `price`, `startsAt`)
`Theater` → `Seat` · `Reservation` (user + showtime) → `ReservationSeat` (one per booked seat)

Overbooking is prevented by `@@unique([showtimeId, seatId])` on `ReservationSeat` — the database
rejects two concurrent requests for the same seat, so no application-level locking is needed.

## Environment variables

| Name           | Meaning                                                        |
| -------------- | -------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string                                   |
| `REDIS_URL`    | Redis connection string (defaults to `redis://localhost:6379`) |
| `JWT_SECRET`   | JWT signing key                                                |
| `PORT`         | HTTP port (defaults to 3000, `.env` currently uses 4000)       |
