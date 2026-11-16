# Install and run

Finance & Assets Dashboard by [Transformaiton.com](https://transformaiton.com/) is a Next.js app. Balances stay in the browser. You do not need an API key, a database, or an account with us to run it.

## Requirements

- Node.js 20.9 or newer (`node -v`)
- npm 10 or newer (included with current Node.js releases)
- A current desktop or mobile browser: Chrome, Firefox, Safari, or Edge
- Git, if you are cloning the repository

Check both tools before you start:

```bash
node -v
npm -v
```

If `node -v` prints a version older than 20.9, install a current Node.js LTS from [nodejs.org](https://nodejs.org/) and open a new terminal.

## 1. Get the code

```bash
git clone https://github.com/Transformaiton/APP-finance-assets-dashboard.git
cd APP-finance-assets-dashboard
```

## 2. Install dependencies

```bash
npm install
```

This reads `package.json` and installs Next.js 16 and React 19. It does not download private packages and it does not ask for credentials.

## 3. Start the development server

```bash
npm run dev
```

Leave that terminal open. When Next.js is ready it prints a local address, normally:

```text
http://localhost:3000
```

Open that address. The first visit loads a fictional demo portfolio so you can try every screen before typing your own figures.

## 4. Production build (optional)

Use this when you want to confirm the app builds, or when you are putting it on a host:

```bash
npm run build
npm start
```

`npm start` serves the production build at http://localhost:3000. Stop the development server first if it is already using that port.

## Configuration

This version has no server configuration.

| Item | What to know |
| --- | --- |
| Environment variables | None. Do not add real keys to the repo. `.env`, `.env.local`, and common key filenames are listed in `.gitignore`. |
| Database | None. There is nothing to migrate. |
| Currency | Displayed as US dollars. |
| Demo portfolio | Defined in `app/demo-data.js`. Edit that file only if you want a different sample. Keep the sample fictional if you publish the change. |
| Saved edits | Stored in the browser under keys that start with `tfa_finance_`. Clearing site data for localhost removes them. |

The dashboard does not read older `mmd_` browser keys from earlier copies of this project. That is deliberate, so a browser that once held a private portfolio does not load it into this public build.

## Deploy a public demo

The app can be hosted as a static-feeling Next.js site (Vercel or any Node host). Hosting does not sync balances between visitors. Each browser keeps its own copy.

1. Push your fork to GitHub.
2. Import the repository in your host and choose the Next.js preset if one is offered.
3. Leave environment variables empty.
4. Deploy, then open the site and confirm the amber "Fictional demo" banner is visible.

Do not deploy a build that contains real balances, account numbers, or customer names in `app/demo-data.js`.

## Update an existing checkout

```bash
git pull
npm install
npm run dev
```

## Troubleshooting

**Port 3000 is already in use.** Stop the other process, or start Next on another port:

```bash
npx next dev -p 3001
```

**The page is blank or stuck on "Loading".** Hard-refresh the browser. If it continues, open the developer console and look for a red error. Then delete the site's local storage for this origin and reload.

**The demo portfolio disappeared.** It was replaced by edits saved in this browser. Click **Reset demo data** to bring the fictional portfolio back.

**`npm install` fails with an old Node version.** Upgrade to Node.js 20.9 or newer and run `npm install` again.

**A secret file was almost committed.** Check `git status` before you commit. `.env` files and common key filenames are ignored. If `git status` still shows one, do not commit it. Rotate that credential, because ignoring a file does not remove it from history after it has been pushed.

## Contact

Questions about running the project: [info@transformaiton.com](mailto:info@transformaiton.com).
