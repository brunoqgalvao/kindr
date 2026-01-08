#!/usr/bin/env node

/**
 * Fetch Brazilian baby names from IBGE API and generate seed data
 *
 * Usage:
 *   node scripts/fetch-ibge-names.js           # Fast mode (fetch all decades quickly)
 *   node scripts/fetch-ibge-names.js --slow    # Slow mode (1 request/second, polite to API)
 *   node scripts/fetch-ibge-names.js --decades 2010,2000,1990  # Specific decades
 *
 * This script fetches authentic Brazilian name data from the official
 * IBGE (Brazilian Institute of Geography and Statistics) API and generates
 * a seed.sql file with real frequency counts.
 */

const fs = require('fs');
const path = require('path');

const IBGE_API_BASE = 'https://servicodados.ibge.gov.br/api/v2/censos/nomes';

// Parse command line arguments
const args = process.argv.slice(2);
const SLOW_MODE = args.includes('--slow');
const decadesArg = args.find(arg => arg.startsWith('--decades='));
const DECADES = decadesArg
  ? decadesArg.split('=')[1].split(',').map(Number)
  : [2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930]; // All available decades

const RATE_LIMIT_MS = SLOW_MODE ? 1000 : 100; // 1 second between requests in slow mode

// Name meanings database (Portuguese names with their origins and meanings)
const NAME_METADATA = {
  // Female names
  'MARIA': { origin: 'Hebrew', meaning: 'Wished-for child, bitter', gender: 'F' },
  'ANA': { origin: 'Hebrew', meaning: 'Grace, favor', gender: 'F' },
  'VITORIA': { origin: 'Latin', meaning: 'Victory', gender: 'F' },
  'JULIA': { origin: 'Latin', meaning: 'Youthful, soft-haired', gender: 'F' },
  'LETICIA': { origin: 'Latin', meaning: 'Joy, happiness', gender: 'F' },
  'AMANDA': { origin: 'Latin', meaning: 'Worthy of love', gender: 'F' },
  'BEATRIZ': { origin: 'Latin', meaning: 'She who brings happiness', gender: 'F' },
  'LARISSA': { origin: 'Greek', meaning: 'Cheerful', gender: 'F' },
  'GABRIELA': { origin: 'Hebrew', meaning: 'God is my strength', gender: 'F' },
  'MARIANA': { origin: 'Hebrew/Latin', meaning: 'Star of the sea', gender: 'F' },
  'BRUNA': { origin: 'German', meaning: 'Brown-haired', gender: 'F' },
  'CAMILA': { origin: 'Latin', meaning: 'Young ceremonial attendant', gender: 'F' },
  'ISABELA': { origin: 'Hebrew', meaning: 'Devoted to God', gender: 'F' },
  'LUANA': { origin: 'Hawaiian', meaning: 'Content, happy', gender: 'F' },
  'SARA': { origin: 'Hebrew', meaning: 'Princess', gender: 'F' },
  'EDUARDA': { origin: 'English', meaning: 'Wealthy guardian', gender: 'F' },
  'BIANCA': { origin: 'Italian', meaning: 'White, pure', gender: 'F' },
  'RAFAELA': { origin: 'Hebrew', meaning: 'God has healed', gender: 'F' },
  'GEOVANA': { origin: 'Italian', meaning: 'God is gracious', gender: 'F' },
  'FERNANDA': { origin: 'German', meaning: 'Adventurous, daring traveler', gender: 'F' },
  'CAROLINA': { origin: 'German', meaning: 'Free woman', gender: 'F' },
  'SOPHIA': { origin: 'Greek', meaning: 'Wisdom', gender: 'F' },
  'VALENTINA': { origin: 'Latin', meaning: 'Strong, healthy', gender: 'F' },
  'ALICE': { origin: 'German', meaning: 'Noble, of noble lineage', gender: 'F' },
  'HELENA': { origin: 'Greek', meaning: 'Shining light, torch', gender: 'F' },
  'LAURA': { origin: 'Latin', meaning: 'Laurel tree, victory', gender: 'F' },
  'MANUELA': { origin: 'Hebrew', meaning: 'God is with us', gender: 'F' },
  'GIOVANNA': { origin: 'Italian', meaning: 'God is gracious', gender: 'F' },
  'LUIZA': { origin: 'German', meaning: 'Famous warrior', gender: 'F' },
  'NATALIA': { origin: 'Latin', meaning: 'Christmas day', gender: 'F' },
  'LORENA': { origin: 'Latin', meaning: 'Laurel tree', gender: 'F' },
  'CLARA': { origin: 'Latin', meaning: 'Clear, bright', gender: 'F' },
  'CECILIA': { origin: 'Latin', meaning: 'Blind to one\'s own beauty', gender: 'F' },
  'LIVIA': { origin: 'Latin', meaning: 'Olive, symbol of peace', gender: 'F' },
  'ISADORA': { origin: 'Greek', meaning: 'Gift of Isis', gender: 'F' },
  'MARINA': { origin: 'Latin', meaning: 'Of the sea', gender: 'F' },
  'LUNA': { origin: 'Latin', meaning: 'Moon', gender: 'F' },
  'STELLA': { origin: 'Latin', meaning: 'Star', gender: 'F' },
  'AURORA': { origin: 'Latin', meaning: 'Dawn', gender: 'F' },
  'ANTONELLA': { origin: 'Latin', meaning: 'Priceless one', gender: 'F' },
  'ALINE': { origin: 'French', meaning: 'Noble', gender: 'F' },
  'PATRICIA': { origin: 'Latin', meaning: 'Noble', gender: 'F' },
  'ADRIANA': { origin: 'Latin', meaning: 'From Hadria', gender: 'F' },
  'JESSICA': { origin: 'Hebrew', meaning: 'God beholds', gender: 'F' },
  'JULIANA': { origin: 'Latin', meaning: 'Youthful', gender: 'F' },
  'MARCIA': { origin: 'Latin', meaning: 'Warlike', gender: 'F' },
  'SANDRA': { origin: 'Greek', meaning: 'Defender of mankind', gender: 'F' },
  'FRANCISCA': { origin: 'Latin', meaning: 'Free one', gender: 'F' },
  'VANESSA': { origin: 'Greek', meaning: 'Butterfly', gender: 'F' },
  'ROSANGELA': { origin: 'Latin', meaning: 'Rose angel', gender: 'F' },

  // Male names
  'JOAO': { origin: 'Hebrew', meaning: 'God is gracious', gender: 'M' },
  'GABRIEL': { origin: 'Hebrew', meaning: 'God is my strength', gender: 'M' },
  'LUCAS': { origin: 'Greek', meaning: 'Light-giving', gender: 'M' },
  'PEDRO': { origin: 'Greek', meaning: 'Stone, rock', gender: 'M' },
  'MATEUS': { origin: 'Hebrew', meaning: 'Gift of God', gender: 'M' },
  'JOSE': { origin: 'Hebrew', meaning: 'God will increase', gender: 'M' },
  'GUSTAVO': { origin: 'Swedish', meaning: 'Staff of the gods', gender: 'M' },
  'GUILHERME': { origin: 'German', meaning: 'Resolute protector', gender: 'M' },
  'CARLOS': { origin: 'German', meaning: 'Free man', gender: 'M' },
  'VITOR': { origin: 'Latin', meaning: 'Victor, winner', gender: 'M' },
  'FELIPE': { origin: 'Greek', meaning: 'Lover of horses', gender: 'M' },
  'MARCOS': { origin: 'Latin', meaning: 'Dedicated to Mars', gender: 'M' },
  'RAFAEL': { origin: 'Hebrew', meaning: 'God has healed', gender: 'M' },
  'LUIZ': { origin: 'German', meaning: 'Famous warrior', gender: 'M' },
  'DANIEL': { origin: 'Hebrew', meaning: 'God is my judge', gender: 'M' },
  'EDUARDO': { origin: 'English', meaning: 'Wealthy guardian', gender: 'M' },
  'MATHEUS': { origin: 'Hebrew', meaning: 'Gift of God', gender: 'M' },
  'LUIS': { origin: 'German', meaning: 'Famous warrior', gender: 'M' },
  'BRUNO': { origin: 'German', meaning: 'Brown', gender: 'M' },
  'PAULO': { origin: 'Latin', meaning: 'Small, humble', gender: 'M' },
  'MIGUEL': { origin: 'Hebrew', meaning: 'Who is like God?', gender: 'M' },
  'ARTHUR': { origin: 'Celtic', meaning: 'Bear, noble', gender: 'M' },
  'HEITOR': { origin: 'Greek', meaning: 'Holding fast', gender: 'M' },
  'BERNARDO': { origin: 'German', meaning: 'Strong as a bear', gender: 'M' },
  'THEO': { origin: 'Greek', meaning: 'Gift of God', gender: 'M' },
  'DAVI': { origin: 'Hebrew', meaning: 'Beloved', gender: 'M' },
  'LORENZO': { origin: 'Latin', meaning: 'From Laurentum', gender: 'M' },
  'ENZO': { origin: 'Italian', meaning: 'Ruler of the home', gender: 'M' },
  'SAMUEL': { origin: 'Hebrew', meaning: 'God has heard', gender: 'M' },
  'NICOLAS': { origin: 'Greek', meaning: 'Victory of the people', gender: 'M' },
  'ANTONIO': { origin: 'Latin', meaning: 'Priceless', gender: 'M' },
  'FRANCISCO': { origin: 'Latin', meaning: 'Free one', gender: 'M' },
  'RODRIGO': { origin: 'Germanic', meaning: 'Famous ruler', gender: 'M' },
  'THIAGO': { origin: 'Hebrew', meaning: 'Supplanter', gender: 'M' },
  'HENRIQUE': { origin: 'German', meaning: 'Home ruler', gender: 'M' },
  'MARCELO': { origin: 'Latin', meaning: 'Young warrior', gender: 'M' },
  'LEONARDO': { origin: 'German', meaning: 'Brave lion', gender: 'M' },
  'CAIO': { origin: 'Latin', meaning: 'Rejoice', gender: 'M' },
  'VINICIUS': { origin: 'Latin', meaning: 'Wine', gender: 'M' },
  'MURILO': { origin: 'Celtic', meaning: 'Bright sea', gender: 'M' },
  'FERNANDO': { origin: 'German', meaning: 'Adventurous', gender: 'M' },
  'ANDRE': { origin: 'Greek', meaning: 'Manly', gender: 'M' },
  'DIEGO': { origin: 'Spanish', meaning: 'Supplanter', gender: 'M' },
  'ALEXANDRE': { origin: 'Greek', meaning: 'Defender of mankind', gender: 'M' },
  'RICARDO': { origin: 'German', meaning: 'Strong ruler', gender: 'M' },
  'LEANDRO': { origin: 'Greek', meaning: 'Lion man', gender: 'M' },
  'ANDERSON': { origin: 'English', meaning: 'Son of Andrew', gender: 'M' },
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchIBGENames(decade, sex) {
  const params = new URLSearchParams();
  params.append('decada', decade);
  if (sex) params.append('sexo', sex);

  const url = `${IBGE_API_BASE}/ranking?${params}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data[0]?.res || [];
  } catch (error) {
    console.error(`  ⚠️  Failed to fetch ${sex} names from ${decade}s: ${error.message}`);
    return [];
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatNameForSQL(nameData, ranking) {
  const name = capitalize(nameData.nome);
  const metadata = NAME_METADATA[nameData.nome] || {
    origin: 'Portuguese',
    meaning: '',
    gender: nameData.sexo || 'U'
  };

  const origin = metadata.origin;
  const meaning = metadata.meaning.replace(/'/g, "''"); // Escape single quotes
  const gender = metadata.gender;
  const frequency = nameData.frequencia;

  return `('${name}', '${gender}', 'BR', '${origin}', '${meaning}', ${ranking}, ${frequency})`;
}

async function fetchAllDecades(sex) {
  const allNames = new Map(); // Use map to deduplicate by name
  let requestCount = 0;

  console.log(`\n📊 Fetching ${sex === 'F' ? 'female' : 'male'} names from ${DECADES.length} decades...`);

  for (const decade of DECADES) {
    if (requestCount > 0 && SLOW_MODE) {
      process.stdout.write(`  ⏳ Waiting ${RATE_LIMIT_MS}ms... `);
      await sleep(RATE_LIMIT_MS);
      process.stdout.write('✓\n');
    }

    process.stdout.write(`  ${decade}s: `);
    const names = await fetchIBGENames(decade, sex);
    process.stdout.write(`${names.length} names\n`);

    // Merge names, keeping highest frequency count
    names.forEach(nameData => {
      const existing = allNames.get(nameData.nome);
      if (!existing || nameData.frequencia > existing.frequencia) {
        allNames.set(nameData.nome, nameData);
      }
    });

    requestCount++;
  }

  // Convert map to array and sort by frequency
  const sortedNames = Array.from(allNames.values())
    .sort((a, b) => b.frequencia - a.frequencia);

  console.log(`  ✅ Total unique names: ${sortedNames.length}`);
  return sortedNames;
}

async function generateSeedFile() {
  const startTime = Date.now();

  console.log('🇧🇷 Fetching Brazilian names from IBGE API');
  console.log(`Mode: ${SLOW_MODE ? 'SLOW (rate-limited)' : 'FAST'}`);
  console.log(`Decades: ${DECADES.join(', ')}`);

  // Fetch data from IBGE
  const femaleNames = await fetchAllDecades('F');
  const maleNames = await fetchAllDecades('M');

  // Limit to top 200 of each
  const topFemale = femaleNames.slice(0, 200);
  const topMale = maleNames.slice(0, 200);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n⏱️  Completed in ${elapsed}s`);

  // Generate SQL
  let sql = `-- Kindr Baby Name App - Seed Data
-- Brazilian names sourced from IBGE (Brazilian Institute of Geography and Statistics)
-- Data aggregated from multiple decades (${DECADES.join(', ')})
-- Generated: ${new Date().toISOString()}
--
-- Source: https://servicodados.ibge.gov.br/api/v2/censos/nomes
-- Documentation: https://servicodados.ibge.gov.br/api/docs/nomes
--
-- Notes:
-- - Names are sorted by highest frequency across all decades
-- - Each name shows its peak registration count
-- - Total unique names fetched: ${femaleNames.length + maleNames.length}
-- - Top ${topFemale.length} female and ${topMale.length} male names included

-- ============================================
-- BRAZILIAN NAMES - Female
-- ============================================

INSERT INTO names (name, gender, country, origin, meaning, popularity_rank, registration_count) VALUES\n`;

  // Add female names
  const femaleSQL = topFemale.map((name, idx) =>
    formatNameForSQL(name, idx + 1)
  ).join(',\n');
  sql += femaleSQL + ';\n\n';

  // Add male names
  sql += `-- ============================================
-- BRAZILIAN NAMES - Male
-- ============================================

INSERT INTO names (name, gender, country, origin, meaning, popularity_rank, registration_count) VALUES\n`;

  const maleSQL = topMale.map((name, idx) =>
    formatNameForSQL(name, idx + 1)
  ).join(',\n');
  sql += maleSQL + ';\n\n';

  // Add note about US data
  sql += `-- ============================================
-- US NAMES
-- ============================================
-- US name data can be added here
-- Source: Social Security Administration (SSA)
-- https://www.ssa.gov/oact/babynames/
`;

  // Write to file
  const outputPath = path.join(__dirname, '..', 'supabase', 'seed-ibge.sql');
  fs.writeFileSync(outputPath, sql, 'utf8');

  console.log(`\n✅ Generated seed file: ${outputPath}`);
  console.log(`\n📈 Statistics:`);
  console.log(`  Female names: ${topFemale.length} (from ${femaleNames.length} unique)`);
  console.log(`  Male names: ${topMale.length} (from ${maleNames.length} unique)`);
  console.log(`  Total in seed file: ${topFemale.length + topMale.length}`);
  console.log(`\n🏆 Top 10 Female: ${topFemale.slice(0, 10).map(n => capitalize(n.nome)).join(', ')}`);
  console.log(`🏆 Top 10 Male: ${topMale.slice(0, 10).map(n => capitalize(n.nome)).join(', ')}`);
}

// Run the script
generateSeedFile().catch(error => {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
