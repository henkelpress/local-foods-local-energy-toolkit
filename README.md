# Local Foods, Local Energy Toolkit

Live site: https://henkelpress.github.io/local-foods-local-energy-toolkit/

A static, deterministic screening application for conversations about food and energy production on the same land. It was adapted from EPR's approved Excel self-assessment workbook for the U.S. Environmental Protection Agency's Local Foods, Local Places technical-assistance work.

## What it includes

- 40,502 ZIP-level profiles
- USDA hardiness, climate, utility, rate, RTO, transmission, solar, geothermal, and wind context
- 45 agrivoltaic case studies and 47 other agroenergy cases
- 194 current-link-reviewed funding records and 18 technical resources
- Transparent workbook-derived solar area and annual-output formulas
- Horticultural guidance, planner questions, shareable screens, and downloadable screening memos

## Run locally

Serve the repository with any static server, then open the local URL.

```powershell
python -m http.server 8000
```

## Screening boundary

This tool does not replace parcel analysis, survey, engineering, utility review, financial analysis, zoning interpretation, legal advice, agricultural planning, or permit decisions. Verify programs, laws, rates, and site conditions before acting.

## Data and release notes

The public dataset is a compact, curated web subset generated from the approved workbooks. Known 404/410 links were replaced or removed before release; three no-longer-current funding rows were excluded from active results. The tool is deterministic and uses no analytics, account system, API key, or server-side data collection.
