# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Decision Model UI v2 is the user interface for the Decision Model project. The repository is newly initialized and contains no application code yet — no framework, build tooling, or test setup has been chosen. Update this file with build/lint/test commands and architecture notes once the stack is in place.

## Repository

- Remote: https://github.com/garrettwwalker/decision-model-ui-v2 (public), default branch `main`.
- Commit identity is configured per-repo (`git config user.name` / `user.email`), not globally.

## Git workflow

- Commit regularly: make a commit after each logical unit of work rather than batching unrelated changes.
- Push to GitHub (`git push`) after committing so the remote stays current; this is pre-authorized for this repo.
- Write clean commit messages: a concise imperative summary line (≤ 72 chars, e.g. "Add decision tree editor"), optionally followed by a blank line and a short body explaining why.
