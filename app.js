// app.js

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// 1. Initialize Supabase client
const SUPABASE_URL   = 'https://czsplorlrzvanxpwkvru.supabase.co';
const SUPABASE_ANON  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c3Bsb3Jscnp2YW54cHdrdnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzg3OTUsImV4cCI6MjA2MjY1NDc5NX0.XfJ3e6VlRmyd-ypchibd2jz03hEgZ9m5L1m8o7yFcdY';
const supabase       = createClient(SUPABASE_URL, SUPABASE_ANON);

// In-memory lookup tables
let speciesData = {};
let roleData    = {};

// Skill name → input element ID mapping
const skillToId = {
  'Agility':'dex-agility','Blasters':'dex-blasters','Melee':'dex-melee','Steal':'dex-steal','Throw':'dex-throw',
  'Galaxy':'kno-galaxy','Streetwise':'kno-streetwise','Survival':'kno-survival','Willpower':'kno-willpower','Xenology':'kno-xenology',
  'Astrogation':'mec-astrogation','Drive':'mec-drive','Gunnery':'mec-gunnery','Pilot':'mec-pilot','Sensors':'mec-sensors',
  'Deceive':'per-deceive','Hide':'per-hide','Persuade':'per-persuade','Search':'per-search','Tactics':'per-tactics',
  'Athletics':'str-athletics','Brawl':'str-brawl','Intimidate':'str-intimidate','Stamina':'str-stamina','Swim':'str-swim',
  'Armament':'tec-armament','Computers':'tec-computers','Droids':'tec-droids','Medicine':'tec-medicine','Vehicles':'tec-vehicles',
  'Alter':'for-alter','Control':'for-control','Sense':'for-sense'
};

// 2. Fetch lookup data from Supabase
// Note: Table names must match exactly
async function fetchSpecies() {
  // Fetch all columns to inspect actual field names
  const { data, error } = await supabase
    .from('species')
    .select('*');
  if (error) {
    console.error('Error fetching species:', error);
    return;
  }
  console.log('🐙 Raw species data:', data);
  data.forEach(s => {
    // TODO: replace these key lookups with actual column names from the raw data above
    speciesData[s.name] = {
      DEX: s.dex,
      KNO: s.kno,
      MEC: s.mec,
      PER: s.per,
      STR: s.str,
      TEC: s.tec,
      FOR: s['for']
    };
  });
}

async function fetchRoles() {
  // Fetch all columns to inspect actual field names
  const { data, error } = await supabase
    .from('roles')
    .select('*');
  if (error) {
    console.error('Error fetching roles:', error);
    return;
  }
  console.log('🐙 Raw roles data:', data);
  data.forEach(r => {
    // TODO: replace these property accesses with the correct column names
    roleData[r.name] = {
      attrs: {
        DEX: r.dex_mod,
        KNO: r.kno_mod,
        MEC: r.mec_mod,
        PER: r.per_mod,
        STR: r.str_mod,
        TEC: r.tec_mod,
        FOR: r.for_mod
      },
      skillBoosts: r.skill_boosts || []
    };
  });
}= await supabase
    .from('species')
    .select('name, dex, kno, mec, per, str, tec, for');
  if (error) return console.error('Error fetching species:', error);
  data.forEach(s => {
    speciesData[s.name] = {
      DEX: s.dex, KNO: s.kno, MEC: s.mec, PER: s.per,
      STR: s.str, TEC: s.tec, FOR: s['for']
    };
  });
}

async function fetchRoles() {
  const { data, error } = await supabase
    .from('roles')
    .select('name, dex_mod, kno_mod, mec_mod, per_mod, str_mod, tec_mod, for_mod, skill_boosts');
  if (error) return console.error('Error fetching roles:', error);
  data.forEach(r => {
    roleData[r.name] = {
      attrs: {
        DEX: r.dex_mod, KNO: r.kno_mod, MEC: r.mec_mod, PER: r.per_mod,
        STR: r.str_mod, TEC: r.tec_mod, FOR: r.for_mod
      },
      skillBoosts: r.skill_boosts || []
    };
  });
}

// 3. Populate dropdown selectors
function populateSelectors() {
  const spSel = document.getElementById('species-select');
  const rlSel = document.getElementById('role-select');
  spSel.innerHTML = '';
  rlSel.innerHTML = '';
  spSel.add(new Option('— Select Species —',''));
  Object.keys(speciesData).forEach(n => spSel.add(new Option(n,n)));
  rlSel.add(new Option('— Select Role —',''));
  Object.keys(roleData).forEach(n => rlSel.add(new Option(n,n)));
}

// 4a. Update attribute dice codes
function updateAttributes() {
  const sp = document.getElementById('species-select').value;
  const rl = document.getElementById('role-select').value;
  const base = speciesData[sp] || {};
  const mod  = (roleData[rl]||{}).attrs || {};
  ['DEX','KNO','MEC','PER','STR','TEC','FOR'].forEach(a => {
    const inp = document.getElementById(`${a.toLowerCase()}-dice`);
    if (!inp) return;
    const total = (base[a]||0) + (mod[a]||0);
    inp.value = total > 0 ? `${total}D` : '';
  });
}

// 4b. Update skill pips based on role boosts
function updateSkills() {
  Object.values(skillToId).forEach(id => {
    const inp = document.getElementById(id);
    if (inp) inp.value = 0;
  });
  const rl = document.getElementById('role-select').value;
  const boosts = roleData[rl]?.skillBoosts || [];
  boosts.forEach(skill => {
    const id = skillToId[skill];
    const inp = document.getElementById(id);
    if (inp) inp.value = (parseInt(inp.value)||0) + 1;
  });
}

// 5. Bootstrap on DOM ready
// Ensure this script is loaded with <script type="module">
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([fetchSpecies(), fetchRoles()]);
  populateSelectors();
  document.getElementById('species-select')
    .addEventListener('change', () => { updateAttributes(); updateSkills(); });
  document.getElementById('role-select')
    .addEventListener('change',    () => { updateAttributes(); updateSkills(); });
  updateAttributes();
  updateSkills();
});
