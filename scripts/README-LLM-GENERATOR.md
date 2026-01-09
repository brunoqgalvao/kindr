# LLM Name Generator

Generate thousands of realistic baby names using AI models via navi-llm.

## Quick Start

```bash
# Generate 2000 Brazilian + 2000 US names (default)
node scripts/generate-names-llm.js

# Custom amounts
node scripts/generate-names-llm.js --br=500 --us=500

# Use different model
node scripts/generate-names-llm.js --model=gpt4o
```

## What It Does

1. **Generates authentic names** using LLMs (GPT-4, Claude, Gemini)
2. **Creates realistic metadata**: origins, meanings, popularity rankings
3. **Batches requests** to avoid rate limits (100 names per batch)
4. **Deduplicates** to ensure unique names
5. **Outputs SQL** ready for seeding your database

## Performance

- **Speed**: ~2-3 minutes per 1000 names (with gpt4-mini)
- **Cost**: ~$0.10 per 1000 names with gpt4-mini
- **Quality**: High - authentic names with proper cultural context

## Example Output

### Brazilian Names
```sql
('Maria', 'F', 'BR', 'Hebrew', 'Wished-for child', 1, 2488835),
('João', 'M', 'BR', 'Hebrew', 'God is gracious', 2, 2345678),
('Tainá', 'F', 'BR', 'Tupi', 'Star', 32, 700000),
('João Pedro', 'M', 'BR', 'Hebrew/Latin', 'God is gracious, rock', 11, 1750000)
```

### US Names
```sql
('Olivia', 'F', 'US', 'Latin', 'Olive tree', 1, 17728),
('Liam', 'M', 'US', 'Irish', 'Strong-willed warrior', 2, 20456),
('Jordan', 'U', 'US', 'Hebrew', 'To flow down', 52, 4100)
```

## Model Options

| Model | Speed | Cost | Quality | Best For |
|-------|-------|------|---------|----------|
| `gpt4-mini` | ⚡⚡⚡ | 💰 | ⭐⭐⭐ | **Default** - Fast & cheap |
| `gpt4o` | ⚡⚡ | 💰💰 | ⭐⭐⭐⭐ | Higher quality names |
| `haiku` | ⚡⚡⚡ | 💰 | ⭐⭐⭐ | Fast alternative |
| `gemini` | ⚡⚡ | 💰 | ⭐⭐⭐ | Free tier available |

## Features

✅ **Cultural Authenticity**
- Brazilian: Portuguese, Tupi indigenous, Italian, German origins
- US: Diverse cultural representation (European, Hispanic, African, Asian)

✅ **Name Variety**
- Traditional classics (Maria, João, Olivia, Liam)
- Modern trending names
- Compound names (João Pedro, Maria Eduarda)
- Unisex names (Jade, Jordan, Ariel)

✅ **Rich Metadata**
- Real origins (Hebrew, Latin, Greek, Tupi, etc.)
- Meaningful translations
- Realistic popularity rankings
- Estimated frequency counts

✅ **Production Ready**
- SQL output ready for seeding
- Proper escaping of special characters
- Deduplication built-in

## Comparison with Other Methods

### IBGE API Fetcher
- **Pros**: 100% authentic government data
- **Cons**: Limited to ~131 unique names (API restriction)
- **Use case**: When you need verified census data

### LLM Generator (This Script)
- **Pros**: Generate thousands of names, full control
- **Cons**: AI-generated (not census data)
- **Use case**: When you need large, diverse dataset

### Hybrid Approach (Recommended)
1. Use IBGE fetcher for top 131 most popular names (authentic data)
2. Use LLM generator to expand to 2000+ names (diversity)
3. Combine both datasets for best of both worlds

## Usage Examples

### Small Test Run
```bash
# Generate 50 of each for testing
node scripts/generate-names-llm.js --br=50 --us=50
```

### Full Production Dataset
```bash
# Generate 2000 of each (takes ~30-40 minutes)
node scripts/generate-names-llm.js --br=2000 --us=2000
```

### Budget-Conscious
```bash
# Use haiku for cheaper generation
node scripts/generate-names-llm.js --model=haiku --br=1000 --us=1000
```

### High Quality
```bash
# Use GPT-4o for best quality
node scripts/generate-names-llm.js --model=gpt4o --br=500 --us=500
```

## Output

Creates `supabase/seed-llm.sql` with:
- Brazilian names with country='BR'
- US names with country='US'
- All names include: name, gender, origin, meaning, rank, frequency

## Rate Limiting

The script includes built-in rate limiting:
- 2 second delay between batches
- 100 names per batch
- Prevents API rate limit errors

For faster generation (if you have higher rate limits):
- Reduce the delay in the script
- Increase batch size

## Troubleshooting

### "No API key found"
Make sure navi-llm is set up:
```bash
bun ~/.claude/skills/navi-llm/setup.ts
```

### Rate limit errors
- Use `--model=haiku` for cheaper/faster model
- Reduce batch counts: `--br=100 --us=100`
- Increase delay between batches in script

### JSON parsing errors
- The script auto-extracts JSON from markdown responses
- If errors persist, try a different model
- Check navi-llm is working: `bun ~/.claude/skills/navi-llm/index.ts models`

## Cost Estimates

With GPT-4o-mini:
- 2000 Brazilian names: ~$0.20
- 2000 US names: ~$0.20
- **Total: ~$0.40 for 4000 names**

With GPT-4o:
- 2000 Brazilian names: ~$2.00
- 2000 US names: ~$2.00
- **Total: ~$4.00 for 4000 names**

## Next Steps

After generating names:

1. **Review the output**
   ```bash
   head -100 supabase/seed-llm.sql
   ```

2. **Combine with IBGE data** (optional)
   ```bash
   # Keep top 131 from IBGE, add LLM-generated for diversity
   cat supabase/seed-ibge.sql supabase/seed-llm.sql > supabase/seed-combined.sql
   ```

3. **Apply to database**
   ```bash
   psql $DATABASE_URL < supabase/seed-llm.sql
   ```
