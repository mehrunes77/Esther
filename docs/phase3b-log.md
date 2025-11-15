# Phase 3B Modernization Log

## 2025-11-12 — Environment Guardrails
- Pinned Node version to 20.11.0 via `.nvmrc`.
- Raised root workspace engine constraints to Node >= 20.11.0 and npm >= 10.0.0.
- Added frontend engine constraints requiring Electron >= 30.0.0.
- Created documentation log to track modernization steps and decisions.

Next actions:
1. Inventory dependencies with `npm outdated --workspaces` and `npx depcheck`.
2. Stage tooling/runtime upgrades in grouped commits.
3. Scaffold parallel Vite environment prior to CRA removal.

## 2025-11-12 — Dependency Inventory
- Ran `npm outdated --workspaces` after network stabilized (VPN disabled).
	- Identified major upgrade targets: React 19.x, TypeScript 5.9, Jest 30.x, Electron Builder 26.x, etc.
- Executed `npx depcheck`; no unused dependencies reported.
- Ready to proceed with staged upgrade plan (tooling -> runtime -> dev utilities).
