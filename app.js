// app.js

// 1. Initialize Supabase client
// Replace these with your actual values (or load from env)
const SUPABASE_URL   = 'https://czsplorlrzvanxpwkvru.supabase.co';
const SUPABASE_ANON  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c3Bsb3Jscnp2YW54cHdrdnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzg3OTUsImV4cCI6MjA2MjY1NDc5NX0.XfJ3e6VlRmyd-ypchibd2jz03hEgZ9m5L1m8o7yFcdY';
const supabase       = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// In-memory lookup tables
let speciesData = {};
let roleData    = {};

// 2. Fetch from Supabase
async function fetchSpecies() {
  const { data, error } = await supabase
    .from('species')
    .select('name, dex, kno, mec, per, str, tec, for');
  if (error) {
    console.error('Error fetching species:', error);
    return;
  }
  data.forEach(s => {
    // store base dice as numbers
    speciesData[s.name] = {
      DEX: s.dex,
      KNO: s.kno,
      MEC: s.mec,
      PER: s.per,
      STR: s.str,
      TEC: s.tec,
      FOR: s.for
    };
  });
}

async function fetchRoles() {
  const { data, error } = await supabase
    .from('roles')
    .select('name, dex_mod, kno_mod, mec_mod, per_mod, str_mod, tec_mod, for_mod, skill_boosts');
  if (error) {
    console.error('Error fetching roles:', error);
    return;
  }
  data.forEach(r => {
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
      skillBoosts: r.skill_boosts // assume this is stored as text[] in Supabase
    };
  });
}

// 3. Populate the Role & Species dropdowns
function populateSelectors() {
  const speciesSel = document.getElementById('species-select');
  const roleSel    = document.getElementById('role-select');

  // clear any placeholder options
  speciesSel.innerHTML = '';
  roleSel.innerHTML    = '';

  // add an empty prompt option
  speciesSel.add(new Option('— Select Species —', ''));
  Object.keys(speciesData).forEach(name => {
    speciesSel.add(new Option(name, name));
  });

  roleSel.add(new Option('— Select Role —', ''));
  Object.keys(roleData).forEach(name => {
    roleSel.add(new Option(name, name));
  });
}

// 4. Recalculate attributes when selection changes
function updateAttributes() {
  const sp = document.getElementById('species-select').value;
  const rl = document.getElementById('role-select').value;
  const base = speciesData[sp] || {};
  const mod  = (roleData[rl]||{}).attrs || {};

  ['DEX','KNO','MEC','PER','STR','TEC','FOR'].forEach(attr => {
    const input = document.getElementById(`${attr.toLowerCase()}-dice`);
    if (!input) return;
    const total = (base[attr] || 0) + (mod[attr] || 0);
    input.value = total > 0 ? `${total}D` : '';
  });

  // TODO: call updateSkills() here to apply species/role skill boosts
}

// 5. Bootstrap on page load
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([ fetchSpecies(), fetchRoles() ]);
  populateSelectors();
  
  // attach listeners
  document.getElementById('species-select')
          .addEventListener('change', updateAttributes);
  document.getElementById('role-select')
          .addEventListener('change',    updateAttributes);

  // initialize with blanks (or you can choose first values)
  updateAttributes();
});
