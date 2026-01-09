#!/usr/bin/env node

/**
 * Generate thousands of baby names using LLMs
 *
 * This script uses navi-llm to generate realistic baby names with authentic
 * metadata (origins, meanings, popularity) for both Brazilian and US datasets.
 *
 * Usage:
 *   node scripts/generate-names-llm.js                    # Generate 2000 BR + 2000 US names
 *   node scripts/generate-names-llm.js --br 500 --us 500  # Custom amounts
 *   node scripts/generate-names-llm.js --model gpt4o      # Use specific model
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
const BR_COUNT = parseInt(args.find(a => a.startsWith('--br'))?.split('=')[1]) || 2000;
const US_COUNT = parseInt(args.find(a => a.startsWith('--us'))?.split('=')[1]) || 2000;
const MODEL = args.find(a => a.startsWith('--model'))?.split('=')[1] || 'gpt4-mini';
const BATCH_SIZE = parseInt(args.find(a => a.startsWith('--batch'))?.split('=')[1]) || 50; // Generate names in batches (smaller = more reliable)

const NAVI_LLM_PATH = path.join(process.env.HOME, '.claude/skills/navi-llm/index.ts');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function callLLM(prompt, systemPrompt = null) {
  const systemArg = systemPrompt ? `--system "${systemPrompt.replace(/"/g, '\\"')}"` : '';
  const cmd = `bun ${NAVI_LLM_PATH} ${MODEL} "${prompt.replace(/"/g, '\\"')}" --json ${systemArg}`;

  try {
    const result = execSync(cmd, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large responses
    });
    return JSON.parse(result).response;
  } catch (error) {
    console.error('LLM call failed:', error.message);
    return null;
  }
}

async function generateBrazilianNamesBatch(startRank, count, retries = 3) {
  const prompt = `Generate exactly ${count} authentic Brazilian baby names starting from popularity rank ${startRank}.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "name": "Maria",
    "gender": "F",
    "origin": "Hebrew",
    "meaning": "Wished-for child, bitter",
    "rank": ${startRank},
    "frequency": 2488835
  }
]

Requirements:
- Mix of male (M), female (F), and unisex (U) names
- Real Brazilian names (Portuguese, indigenous Tupi, Italian, etc.)
- Authentic origins (Hebrew, Latin, Greek, Portuguese, Tupi, German, Italian, etc.)
- Meaningful translations in English
- Realistic frequency counts (higher ranks = higher frequencies)
- Include modern popular names AND traditional classics
- Some compound names (João Pedro, Maria Eduarda, etc.)
- Rank should increment: ${startRank}, ${startRank + 1}, ${startRank + 2}...`;

  const systemPrompt = 'You are a Brazilian demographics expert. Generate ONLY valid JSON arrays with no additional text.';

  console.log(`  Generating Brazilian names ${startRank}-${startRank + count - 1}...`);
  const response = callLLM(prompt, systemPrompt);

  if (!response) return [];

  try {
    // Try to extract JSON if wrapped in markdown code blocks
    let jsonStr = response;

    // Remove markdown code block wrappers (```json ... ```)
    jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

    // Extract just the JSON array
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    jsonStr = jsonMatch ? jsonMatch[0] : jsonStr;

    const names = JSON.parse(jsonStr);

    // Validate structure
    if (!Array.isArray(names)) {
      console.error('  ⚠️  Response is not an array');
      return [];
    }

    const validNames = names.filter(n =>
      n.name && n.gender && n.origin && n.meaning && typeof n.rank === 'number' && typeof n.frequency === 'number'
    );

    console.log(`  ✓ Generated ${validNames.length} valid names`);
    return validNames;
  } catch (error) {
    console.error('  ⚠️  Failed to parse JSON:', error.message);
    if (retries > 0) {
      console.log(`  🔄 Retrying... (${retries} attempts left)`);
      await sleep(2000);
      return generateBrazilianNamesBatch(startRank, count, retries - 1);
    }
    return [];
  }
}

async function generateUSNamesBatch(startRank, count, retries = 3) {
  const prompt = `Generate exactly ${count} authentic American baby names starting from popularity rank ${startRank}.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "name": "Olivia",
    "gender": "F",
    "origin": "Latin",
    "meaning": "Olive tree",
    "rank": ${startRank},
    "frequency": 17728
  }
]

Requirements:
- Mix of male (M), female (F), and unisex (U) names
- Real American names (diverse cultural origins)
- Authentic origins (English, Irish, Hebrew, Greek, Latin, Spanish, etc.)
- Meaningful translations in English
- Realistic frequency counts (higher ranks = higher frequencies)
- Include modern trending names AND timeless classics
- Diverse cultural representation (European, Hispanic, African, Asian origins)
- Rank should increment: ${startRank}, ${startRank + 1}, ${startRank + 2}...`;

  const systemPrompt = 'You are a US demographics expert. Generate ONLY valid JSON arrays with no additional text.';

  console.log(`  Generating US names ${startRank}-${startRank + count - 1}...`);
  const response = callLLM(prompt, systemPrompt);

  if (!response) return [];

  try {
    // Try to extract JSON if wrapped in markdown code blocks
    let jsonStr = response;

    // Remove markdown code block wrappers (```json ... ```)
    jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

    // Extract just the JSON array
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    jsonStr = jsonMatch ? jsonMatch[0] : jsonStr;

    const names = JSON.parse(jsonStr);

    // Validate structure
    if (!Array.isArray(names)) {
      console.error('  ⚠️  Response is not an array');
      return [];
    }

    const validNames = names.filter(n =>
      n.name && n.gender && n.origin && n.meaning && typeof n.rank === 'number' && typeof n.frequency === 'number'
    );

    console.log(`  ✓ Generated ${validNames.length} valid names`);
    return validNames;
  } catch (error) {
    console.error('  ⚠️  Failed to parse JSON:', error.message);
    if (retries > 0) {
      console.log(`  🔄 Retrying... (${retries} attempts left)`);
      await sleep(2000);
      return generateUSNamesBatch(startRank, count, retries - 1);
    }
    return [];
  }
}

function deduplicateNames(names) {
  const seen = new Map();
  const unique = [];

  for (const name of names) {
    const key = name.name.toUpperCase();
    if (!seen.has(key)) {
      seen.set(key, true);
      unique.push(name);
    }
  }

  return unique;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatNameForSQL(nameData) {
  const name = capitalize(nameData.name);
  const gender = nameData.gender || 'U';
  const origin = nameData.origin || 'Unknown';
  const meaning = (nameData.meaning || '').replace(/'/g, "''"); // Escape single quotes
  const rank = nameData.rank || 0;
  const frequency = nameData.frequency || 0;

  return `('${name}', '${gender}', 'BR', '${origin}', '${meaning}', ${rank}, ${frequency})`;
}

function formatUSNameForSQL(nameData) {
  const name = capitalize(nameData.name);
  const gender = nameData.gender || 'U';
  const origin = nameData.origin || 'Unknown';
  const meaning = (nameData.meaning || '').replace(/'/g, "''");
  const rank = nameData.rank || 0;
  const frequency = nameData.frequency || 0;

  return `('${name}', '${gender}', 'US', '${origin}', '${meaning}', ${rank}, ${frequency})`;
}

async function generateAllNames() {
  const startTime = Date.now();

  console.log(`🤖 Generating names using LLM: ${MODEL}`);
  console.log(`Target: ${BR_COUNT} Brazilian names + ${US_COUNT} US names`);
  console.log(`Batch size: ${BATCH_SIZE}\n`);

  // Generate Brazilian names
  console.log('🇧🇷 Generating Brazilian names...');
  const brNames = [];
  for (let i = 0; i < BR_COUNT; i += BATCH_SIZE) {
    const count = Math.min(BATCH_SIZE, BR_COUNT - i);
    const batch = await generateBrazilianNamesBatch(i + 1, count);
    brNames.push(...batch);

    // Rate limiting
    if (i + BATCH_SIZE < BR_COUNT) {
      console.log('  ⏳ Waiting 2s to avoid rate limits...');
      await sleep(2000);
    }
  }

  // Generate US names
  console.log('\n🇺🇸 Generating US names...');
  const usNames = [];
  for (let i = 0; i < US_COUNT; i += BATCH_SIZE) {
    const count = Math.min(BATCH_SIZE, US_COUNT - i);
    const batch = await generateUSNamesBatch(i + 1, count);
    usNames.push(...batch);

    // Rate limiting
    if (i + BATCH_SIZE < US_COUNT) {
      console.log('  ⏳ Waiting 2s to avoid rate limits...');
      await sleep(2000);
    }
  }

  // Deduplicate
  const uniqueBR = deduplicateNames(brNames);
  const uniqueUS = deduplicateNames(usNames);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n⏱️  Completed in ${elapsed}s`);

  // Generate SQL
  let sql = `-- Kindr Baby Name App - LLM-Generated Seed Data
-- Generated using ${MODEL} via navi-llm
-- Created: ${new Date().toISOString()}
--
-- Statistics:
-- - Brazilian names: ${uniqueBR.length}
-- - US names: ${uniqueUS.length}
-- - Total names: ${uniqueBR.length + uniqueUS.length}

-- ============================================
-- BRAZILIAN NAMES
-- ============================================

INSERT INTO names (name, gender, country, origin, meaning, popularity_rank, registration_count) VALUES\n`;

  // Add Brazilian names
  const brSQL = uniqueBR.map(name => formatNameForSQL(name)).join(',\n');
  sql += brSQL + ';\n\n';

  // Add US names
  sql += `-- ============================================
-- US NAMES
-- ============================================

INSERT INTO names (name, gender, country, origin, meaning, popularity_rank, registration_count) VALUES\n`;

  const usSQL = uniqueUS.map(name => formatUSNameForSQL(name)).join(',\n');
  sql += usSQL + ';\n';

  // Write to file
  const outputPath = path.join(__dirname, '..', 'supabase', 'seed-llm.sql');
  fs.writeFileSync(outputPath, sql, 'utf8');

  console.log(`\n✅ Generated seed file: ${outputPath}`);
  console.log(`\n📈 Final Statistics:`);
  console.log(`  Brazilian names: ${uniqueBR.length}`);
  console.log(`  US names: ${uniqueUS.length}`);
  console.log(`  Total: ${uniqueBR.length + uniqueUS.length}`);

  console.log(`\n🏆 Sample Brazilian names:`);
  uniqueBR.slice(0, 10).forEach(n => console.log(`  - ${n.name} (${n.gender}, ${n.origin}): ${n.meaning}`));

  console.log(`\n🏆 Sample US names:`);
  uniqueUS.slice(0, 10).forEach(n => console.log(`  - ${n.name} (${n.gender}, ${n.origin}): ${n.meaning}`));
}

// Run the script
generateAllNames().catch(error => {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
