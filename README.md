# Nexus

**Nexus** is a cooperative and competitive multiplayer tower defense game that supports up to eight players simultaneously. 

The core objective is for players to work together to defend a central, valuable location or base—the **Nexus**—against increasingly challenging waves of enemies.

## Features
- **8-Player Co-op**: Strategic teamwork with specialized roles.
- **Real-time Synchronization**: Powered by Socket.io for low-latency gameplay.
- **Persistent Profiles**: Firebase integration for authentication and stats.
- **Integrated Server**: Next.js and Express running on a unified architecture.

## Getting Started
1. `npm install`
2. `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

## Deployment & Configuration Tips

### Double Login / Vercel Authentication
When deploying preview branches on Vercel, the platform automatically enables **Deployment Protection** (Vercel Authentication) by default. This forces visitors to authenticate with Vercel (or enter a protection bypass code) before seeing the page, and then authenticate with the game itself using Firebase.

To disable the Vercel login screen and have a unified single-login experience:
1. Go to your project settings on the **Vercel Dashboard**.
2. Click **Settings** > **Security** (or **Deployment Protection**).
3. Under **Preview Deployment Protection**, select **Disabled** (or configure **Bypass Exceptions**).
4. Save the settings.

