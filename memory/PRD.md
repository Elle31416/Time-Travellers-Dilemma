# Time Traveler's Dilemma — PRD

## Concept
A mobile time-travel survival game where the player picks a historical era, picks one item from a small inventory, writes a free-form survival plan, and an AI "Time Judge" (Claude Sonnet 4.5) returns a dramatic verdict (LEGENDARY / SURVIVED / BARELY MADE IT / PERISHED / CATASTROPHIC) with a survival score 0–100, a vivid narrative, and a historical twist.

## Stack
- **Frontend**: React Native (Expo Router, SDK 54), TypeScript, Reanimated, expo-google-fonts (Cormorant Garamond + Space Mono), expo-linear-gradient, @react-native-async-storage/async-storage, axios.
- **Backend**: FastAPI + Motor (MongoDB), emergentintegrations LlmChat (Anthropic, claude-sonnet-4-5-20250929).
- **Auth**: anonymous device_id (UUID stored in AsyncStorage). No login.

## Screens
1. `/` (index) — Era Selector. Free + Premium eras with lock visuals. Top stats strip.
2. `/picker` — Era hero + scenario + 8-item grid + "Enter the Time Stream" CTA.
3. `/action` — Selected era/item summary + multi-line plan input (300 char cap) + quick prompts + submit.
4. `/verdict` — Animated verdict badge, ticking score meter, narrative card, historical twist card, "Try another era" / "View Time Logs".
5. `/history` — Bento stats grid (total runs, survival %, best score, streak, legendary count) + per-game rows.

## Eras
- Free: roman, titanic, moon.
- Premium (visually locked, non-tappable): pompeii, dday, mars.

## Items (8)
lighter, phone, map, knife, medicine, gold, compass, book.

## API
- `GET /api/eras` — list eras.
- `GET /api/items` — list items.
- `POST /api/judge` — body `{device_id, era_id, item_id, plan}` → verdict + score + narrative + twist. Persisted to `games` collection.
- `GET /api/games?device_id=...` — list game records desc.
- `GET /api/stats?device_id=...` — total_games, survival_rate, best_score, current_streak, legendary_count.
- `DELETE /api/games?device_id=...` — clear history.

## Design
Dark, vintage / chrono-ledger aesthetic. Gold (#c8953a) on warm near-black (#110e0a). Cormorant Garamond headings, Space Mono body/captions. Verdict colour-coded.

## Status
MVP complete: full game loop end-to-end with Claude judge, MongoDB persistence, stats, and history.
