# Local Foods, Local Energy Toolkit

Live site: https://henkelpress.github.io/local-foods-local-energy-toolkit/

A static, deterministic screening application for conversations about food and energy production on the same land. It was adapted from EPR's approved Excel self-assessment workbook for the U.S. Environmental Protection Agency's Local Foods, Local Places technical-assistance work.

## What it includes

- 40,502 ZIP-level profiles
- USDA hardiness, climate, utility, rate, RTO, transmission, solar, geothermal, and wind context
- 92 agro-energy case studies across solar co-location, wind, geothermal, bioenergy, water, manual power, wood, and oil/gas pathways, each with source-provenanced imagery
- 194 current-link-reviewed funding records and 18 technical resources
- Exact-state funding filtering, with only genuinely national labels eligible across state lines
- A corrected, transparent solar screening equation using 35% land coverage, 400 W modules, and an 80% performance factor
- Land and crop guidance, an interactive national case locator, planning questions, shareable screens, and downloadable screening memos

Six case cards use clearly labeled representative project-source images where a site-specific photograph could not be verified. The other 86 use direct case images or images retained from cited case-study sources.

## Run locally

Serve the repository with any static server, then open the local URL.

```powershell
python -m http.server 8000
```

## Solar screening assumptions

The solar result is an illustrative early screen: `modules = floor(area × 35% ÷ 21.5278 sq ft)`, `capacity = modules × 0.40 kW DC`, and `annual kWh = capacity × GHI × 365 × 0.80`. The displayed gross electricity value multiplies modeled output by the selected utility rate. It is not profit, net revenue, lease income, or guaranteed bill savings.

## Screening boundary

This tool does not replace parcel analysis, survey, engineering, utility review, financial analysis, zoning interpretation, legal advice, agricultural planning, or permit decisions. Verify programs, laws, rates, and site conditions before acting.

## Data and release notes

The public dataset is a compact, curated web subset generated from the approved workbooks. Known 404/410 links were replaced or removed before release; three no-longer-current funding rows were excluded from active results. The tool is deterministic and uses no analytics, account system, API key, or server-side data collection.
