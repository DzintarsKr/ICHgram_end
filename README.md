# ICHgram

An Instagram-like photo sharing app: React (Vite SPA) on the front end and an Express + MongoDB API on the back end.

## Develop locally

```bash
cp .env.example .env   # then set MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

`npm run dev` starts the Express API on `PORT` (default 5000) and the Vite dev server on port 8080. Vite proxies `/api` to the API.

Environment variables:

- `PORT`: API port
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: secret used to sign login tokens
- `APP_URL`: public app URL used in password reset links
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: SMTP server for password reset emails

## Project layout

- `ICHgram/client/`: React client (`app/` pages, components, CSS Modules; `vite.config.js`; `index.html`; `public/`)
- `ICHgram/server/`: Express API (`server.js` entry point)
- `ICHgram/server/src/config/`: database connection and JWT helpers
- `ICHgram/server/src/models/`: Mongoose models (users, posts, likes, comments, follows, notifications, messages)
- `ICHgram/server/src/controllers/`: request handlers
- `ICHgram/server/src/routes/`: API routes under `/api`
- `ICHgram/server/src/middlewares/`: JWT auth, image upload (multer, memory storage), error handling
- `ICHgram/server/src/sockets/`: Socket.IO server for real-time direct messages (JWT-authenticated)
- `ICHgram/server/src/utils/`: serializers, validation, and helpers

## Scripts

- `npm run dev`: API and Vite dev server together
- `npm run build`: production client build into `ICHgram/client/dist/`
- `npm start`: run the API, serving `ICHgram/client/dist/` when it exists
