# Kiosk Backend (MERN) - MVP Scaffold

This is a MERN-style backend scaffold for the Loyalty Kiosk MVP (Milestones 1 & 2).

## Features
- Express + Mongoose (MongoDB)
- Twilio integration (send compliance SMS)
- Endpoints: /kiosk/checkin, /kiosk/webhook/twilio, admin routes (create business, upload logo, logs)
- JWT admin auth

## Quick start
1. Copy `.env.example` to `.env` and fill values.
2. `npm install`
3. `npm run dev` (requires nodemon) or `npm start`
4. Use API endpoints as documented in the code comments.

## Security
- **Rotate** any Twilio credentials you posted publicly.
- Do not commit `.env` to source control.
