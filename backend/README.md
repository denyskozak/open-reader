# Books Miniapp API

A minimal type-safe REST API built with Node.js, TypeScript, and [Hono](https://hono.dev/). It demonstrates request validation with Zod and an in-memory purchase store.

## Getting Started

```bash
npm install
npm run dev
```

The development server runs on port `3000` by default. Override the port using a `.env` file with `PORT=4000`, or set the `PORT` environment variable when starting the server.

## Test Requests

```bash
curl -H "X-Test-Env: true" http://localhost:3000/api/purchases/123
curl -H "X-Test-Env: true" -H "Content-Type: application/json" \
     -d '{"bookId":"123"}' http://localhost:3000/api/stars/invoice
curl -H "X-Test-Env: true" -H "Content-Type: application/json" \
     -d '{"bookId":"123","payment_id":"abc"}' http://localhost:3000/api/purchases/confirm
```

All requests must include the header `X-Test-Env: true`.
