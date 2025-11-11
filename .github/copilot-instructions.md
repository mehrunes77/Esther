<!-- .github/copilot-instructions.md -->
# Copilot / AI agent instructions for this repository

This repository currently contains only a short `README.md` and a `LICENSE` file.
The project has no visible source tree or build files. Use the checklist below to
quickly discover structure, then ask the user or propose a minimal next step.

1. Quick repo facts (what you can see now)
   - `README.md`: describes the project as "Esther is an AI-powered app made for astrologists and astronomers alike." (no build details).
   - No `package.json`, `pyproject.toml`, `requirements.txt`, `Makefile`, `src/`, or other language indicators were found.

2. Primary objective for the agent
   - If the user asked for code changes, ask a clarifying question about the intended language/framework and where to place code.
   - If the user asked to scaffold or implement features, propose a minimal scaffold (language, folder layout, basic build/test) and get explicit approval before creating large changes.

3. Discovery checklist (run before making assumptions)
   - Search for language/build files: `package.json`, `pyproject.toml`, `requirements.txt`, `Pipfile`, `setup.py`, `go.mod`, `Cargo.toml`, `Gemfile`, `pom.xml`, `Makefile`, `Dockerfile`.
   - Search for code directories: `src/`, `app/`, `lib/`, `cmd/`, `server/`, `web/`, `frontend/`, `backend/`, `scripts/`, `tests/`.
   - Check GitHub Actions and CI: `.github/workflows/` and any `.circleci/`, `.github/*`.

4. How to act when the repo is sparse (this case)
   - Do NOT invent a project language. Instead, present 2 short scaffold options (e.g., Node.js with `package.json` or Python with `pyproject.toml`) and ask which the user prefers.
   - If asked to implement a feature without language specified, respond with a short plan and file layout, then wait for approval.

5. Project-specific patterns and examples
   - Reference: `README.md` — use this copy to craft commit messages and user-facing text. Eg: "Implement initial backend scaffold for Esther (AI-powered app for astrologists and astronomers)."
   - If the user requests tests, add a small test harness consistent with the chosen language (e.g., `jest` for Node or `pytest` for Python).

6. Merge guidance (when an instruction file already exists)
   - Preserve any repository-specific bullets. If merging, keep short examples and update only to add discovery checklist or to correct outdated commands.

7. Safety and clarity
   - When unsure about credentials, keys, or external services, never create or encode secrets—ask the user how to provide them securely.

If anything here is unclear or you want a different default scaffold (e.g., always use TypeScript), tell me which preference to encode and I will update this instruction file.
