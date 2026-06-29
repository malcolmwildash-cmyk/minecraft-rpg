# minecraft-rpg

## 🏗️ Hosting & Deployment — read this first (humans + AI agents)

Malcolm's sites span **two different accounts**, which is the easy thing to get wrong:

- **GitHub** — `malcolmwildash-cmyk` (Malcolm's account; **all** source lives here)
- **Vercel** — `travis-9112` / team `travis-9112s-projects` (Travis's account; hosts the Vercel sites)
- **Domain `malcolmwildash.com`** — registrar **and** DNS at **GoDaddy** (Travis's account).
  DNS points the domain at Vercel:
  - `A   @   → 76.76.21.21`
  - `CNAME  www → cname.vercel-dns.com`

### This repo (`minecraft-rpg`)
- **Host:** **Vercel**
- **Live:** https://minecraft-rpg.vercel.app
- **Deploy:** Push to `main` → Vercel auto-builds & deploys.

### Every Malcolm site (one account map, mixed hosting)
| Repo | Host | Live URL |
|---|---|---|
| `malcolmwildash.com` | Vercel | https://malcolmwildash.com (flagship + `/games`) |
| `star-robot` | Vercel | https://star-robot.vercel.app |
| `olives-bug-guide` | Vercel | https://olives-bug-guide.vercel.app |
| `minecraft-rpg` | Vercel | https://minecraft-rpg.vercel.app |
| `undertale-simulator` | GitHub Pages | https://malcolmwildash-cmyk.github.io/undertale-simulator/ |
| `minecraft-stick-fighters` | GitHub Pages | https://malcolmwildash-cmyk.github.io/minecraft-stick-fighters/ |
| `indie-cross-brawl` | GitHub Pages | https://malcolmwildash-cmyk.github.io/indie-cross-brawl/ |
| `indy-cross-smash` | not deployed (private WIP) | — |

> Note: hosting is **mixed** — some repos are on **Vercel**, some on **GitHub Pages**. Check the row above for this one. `malcolmwildash.com` itself is on **Vercel**, *not* GitHub Pages.

### ⚠️ Security — credentials
Never commit tokens or embed them in a git remote URL. A local clone of the
`malcolmwildash.com` repo was set up with an **embedded classic, admin-scoped GitHub
Personal Access Token** in `.git/config`. That token **must be rotated**
(GitHub → Settings → Developer settings → Personal access tokens) and git auth should use
the **`gh` CLI credential helper** (`gh auth login`) instead of an embedded token. Do not
paste tokens into code, READMEs, or remote URLs.

---
