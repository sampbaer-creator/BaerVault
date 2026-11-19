# BaerVault monthly review (Weft + Python)

This workflow belongs to the **original BaerVault repository** at `workflows/weft/monthly-review`. Do not create another GitHub repository.

## Workflow

- `src/main.weft` coordinates validation, categorization, recurring-expense detection, budget comparison, Python forecasts, a human approval step, and approved report publication.
- `assets/scripts/forecast.py` uses the median, recency-weighted average, and bounded volatility adjustment on observed months.
- `assets/household.json` contains **synthetic test data only**.
- Approved reports are written into Weft run-scoped storage. Rejected reports are not written.
- This workflow does not need OpenAI or any language model.

## Run from WSL on the Linux filesystem

Weft **cannot watch a working copy on a Windows-mounted drive**, such as `/mnt/c/Users/...`. Keep your normal Windows checkout for VS Code, but also clone the **same BaerVault GitHub repository** into WSL for running Weft.

```bash
cd ~
git clone git@github.com:sampbaer-creator/BaerVault.git BaerVault
cd ~/BaerVault/workflows/weft/monthly-review
weft build
weft run --durable --detach
weft runs
```

If your WSL Git SSH access is not configured, use the authenticated Git HTTPS URL instead. Changes authored on Windows must be committed/pushed and then pulled into the WSL checkout, or vice versa.

This source directory is the canonical location for Weft changes. The older separate `baervault-workflows` repository is retained only for historical reference.

## Live application versus local workflow

The **live** BaerVault website and PWA use `lib/helpers/budgetForecast.ts` from this same repository. They can forecast prior ledger purchases or read-only bank history without calling OpenAI, even when local Weft is offline.

The production Vercel deployment **does not execute Weft**. It needs an authenticated, always-on Weft runtime, signed results, household separation, and an approval API before financial data can flow through a live Weft run. Do not expose WSL or the local Weft port to the public internet. See `../../../docs/weft-orchestration-plan.md`.
