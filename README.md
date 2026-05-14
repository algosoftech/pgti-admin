# PGTI Admin

Admin panel for managing PGTI website content, users, tournaments, media, and CMS sections.

## Stack

- React
- React Router
- Redux Toolkit
- Ant Design
- React Scripts

## Project Structure

- `src/pages/` - admin screens and workflows
- `src/components/` - shared UI, layout, table, and upload components
- `src/services/` - API service layer
- `src/routes/` - route definitions
- `public/` - static assets

## Setup

```bash
npm install
```

Create your local `.env` file before starting.

## Run

```bash
npm start
```

## Build

```bash
npm run build
```

## Notes

- Local environment files, local certificates, build output, and workspace helper folders are excluded from Git.
- This repo is intended to pair with the `pgti-api` backend.
