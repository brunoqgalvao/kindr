# IBGE Name Data Fetcher

This script fetches authentic Brazilian baby name data from the official IBGE (Brazilian Institute of Geography and Statistics) API.

## Usage

```bash
# Fast mode - fetch from all decades (~4 seconds)
node scripts/fetch-ibge-names.js

# Slow mode - rate-limited to 1 req/second (polite to API)
node scripts/fetch-ibge-names.js --slow

# Specific decades only
node scripts/fetch-ibge-names.js --decades=2010,2000,1990
```

## What it does

1. **Fetches real census data** from IBGE's public API across 9 decades (1930s-2010s)
2. **Deduplicates names** appearing in multiple decades, keeping highest frequency
3. **Generates SQL seed file** with authentic frequency counts
4. **Includes name metadata**: origins, meanings, and rankings

## Data Source

- **API**: https://servicodados.ibge.gov.br/api/v2/censos/nomes
- **Documentation**: https://servicodados.ibge.gov.br/api/docs/nomes
- **Decades**: 1930s through 2010s (most recent complete census data)

## Output

- Creates `supabase/seed-ibge.sql` with **131 unique Brazilian names**
- **77 female names** from actual census records
- **54 male names** from actual census records
- Original `seed.sql` remains unchanged (has ~400 names with US data)

## Example Data

Real frequency counts from IBGE census:
- **Maria**: 2,488,835 registrations (peak across all decades)
- **José**: 3,200,679 registrations
- **Ana**: 931,115 registrations
- **João**: 787,738 registrations

## Results from Latest Run

```
🇧🇷 Fetching Brazilian names from IBGE API
Mode: FAST
Decades: 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930

📊 Fetching female names from 9 decades...
  ✅ Total unique names: 77

📊 Fetching male names from 9 decades...
  ✅ Total unique names: 54

⏱️  Completed in 3.9s

📈 Statistics:
  Female names: 77 (from 77 unique)
  Male names: 54 (from 54 unique)
  Total in seed file: 131

🏆 Top 10 Female: Maria, Ana, Jessica, Vitoria, Julia, Adriana, Bruna, Juliana, Aline, Leticia
🏆 Top 10 Male: Jose, Joao, Gabriel, Antonio, Lucas, Pedro, Francisco, Mateus, Rafael, Gustavo
```

## Why This Matters

Using official IBGE data ensures:
- ✅ **Authentic Brazilian names** from actual census records
- ✅ **Real frequency counts** (not estimates)
- ✅ **Cultural accuracy** for Brazilian users
- ✅ **Historical trends** showing name popularity over decades
- ✅ **Comprehensive coverage** - 131 unique names across 90 years

## API Limitations

- IBGE API returns top 20 names per decade per gender
- The 2020s decade data is not yet available (census pending)
- Total unique names: ~131 (some names popular across multiple decades)

## Customization

Edit the script to:
- Change decades: modify the `DECADES` array (line 27)
- Add more name metadata: expand the `NAME_METADATA` object
- Adjust rate limiting: change `RATE_LIMIT_MS` (line 29)
