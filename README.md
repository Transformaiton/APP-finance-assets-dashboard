# My Money Dashboard

A self-owned Next.js personal finance dashboard prototype designed for manual balance tracking, activity logging, category reports, account selection, drag/drop ordering, tile-density controls, and estimated monthly interest.

## Current behavior

- Manual accounts for banks, credit cards, crypto, cash, investments, gift cards, metals and other assets.
- Credit-card debt is represented as a negative balance.
- Add/edit accounts.
- Add positive or negative activities with a category and optional note.
- Account history.
- Filter by account type and see the filtered total.
- Select arbitrary accounts and see/report only those accounts.
- Drag and drop cards to reorder them.
- Choose 1-6 tiles per row on desktop.
- Spending report by day/week/month/all-time and category.
- Custom categories.
- APY field with estimated monthly interest and one-click interest activity.
- Modern responsive layout.

## Important: data storage

This version stores data in the browser using `localStorage`. It is ideal for GitHub/Vercel testing but is **not yet cloud-synced between devices**.

For production, the next step is to replace localStorage with a cloud Postgres database (Neon or Supabase), add authentication/passkeys, and then optionally add Plaid and secure voice/WhatsApp endpoints.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project**.
3. Import the GitHub repository.
4. Vercel should detect Next.js automatically.
5. Click **Deploy**.

## Upload to GitHub manually

Create a new GitHub repository, then from this folder run:

```bash
git init
git add .
git commit -m "Initial My Money Dashboard"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## Next production milestones

- Cloud Postgres data layer
- User authentication and passkeys
- Encrypted server-side secrets
- Plaid institution connections
- PWA install support
- Android quick-add / voice endpoint
- WhatsApp webhook integration
- Automated backups and audit logging

