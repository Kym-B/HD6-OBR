// Supabase setup and Owlbear token sync integration

let supabase;

// Track base attribute values from Species and Role
const speciesAttrs = {};
const roleAttrs = {};
const attrFields = ['dex','kno','mec','per','str','tec','force'];

/**
 * Update attribute inputs and recompute derived stats
 */
function updateAttributeDisplay() {
  attrFields.forEach(attr => {
    const el = document.getElementById(`attr-${attr}`);
    if (el) {
      const base = (speciesAttrs[attr] || 0) + (roleAttrs[attr] || 0);
      el.value = base;
    }
  });
  updateDerivedStats();
}

/**
 * Calculate and display derived stats: Defense, Initiative, Resolve
 */
function updateDerivedStats() {
  const dex = parseInt(document.getElementById('attr-dex')?.value) || 0;
  const agility = parseInt(document.getElementById('skill-agility')?.value) || 0;
  const per = parseInt(document.getElementById('attr-per')?.value) || 0;
  const tactics = parseInt(document.getElementById('skill-tactics')?.value) || 0;
  const str = parseInt(document.getElementById('attr-str')?.value) || 0;
  const stamina = parseInt(document.getElementById('skill-stamina')?.value) || 0;

  const def = 6 + dex + agility;
  const init = 6 + per + tactics;
  const res = 6 + str + stamina;

  document.getElementById('derived-defense').value = def;
  document.getElementById('derived-initiative').value = init;
  document.getElementById('derived-resolve').value = res;
  const current = document.getElementById('current-resolve');
  if (current && (!current.value || isNaN(parseInt(current.value)))) {
    current.value = res;
  }
}

/**
 * Fetches items from a Supabase table and populates a dropdown.
 */
function loadSupabaseItems(table, dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  dropdown.innerHTML = '<option value="">-- Select --</option>';
  supabase.from(table).select('*').then(({ data, error }) => {
    if (error || !data) {
      dropdown.innerHTML = '<option>Error loading</option>';
      return;
    }
    data.sort((a, b) => a.name.localeCompare(b.name));
    data.forEach(item => {
      const opt = document.createElement('option');
      opt.value = JSON.stringify(item);
      opt.textContent = item.name;
      dropdown.appendChild(opt);
    });
  });
}

/** Helper functions for lockable fields, list additions, printing, and tooltips (omitted for brevity) */

// Main initialization after DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  // Initialize Supabase client (must remain exactly as-is)
  supabase = window.supabase.createClient(
    'https://czsplorlrzvanxpwkvru.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c3Bsb3Jscnp2YW54cHdrdnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzg3OTUsImV4cCI6MjA2MjY1NDc5NX0.XfJ3e6VlRmyd-ypchibd2jz03hEgZ9m5L1m8o7yFcdY'
  );

  // Species selection
  loadSupabaseItems('species', 'char-species');
  document.getElementById('char-species')?.addEventListener('change', e => {
    const item = JSON.parse(e.target.value || '{}');
    attrFields.forEach(attr => speciesAttrs[attr] = parseInt(item[attr]) || 0);
    updateAttributeDisplay();
  });

  // Role selection
  loadSupabaseItems('roles', 'char-role');
  document.getElementById('char-role')?.addEventListener('change', e => {
    const item = JSON.parse(e.target.value || '{}');
    attrFields.forEach(attr => roleAttrs[attr] = parseInt(item[attr]) || 0);
    updateAttributeDisplay();
  });

  // Initial derived stats calculation
  updateDerivedStats();

  // Populate other dropdowns (edges, burdens, weapons, armor, equipment)
  loadSupabaseItems('edges', 'char-edge');
  loadSupabaseItems('burdens', 'char-burden');
  loadSupabaseItems('weapons', 'weapon-dropdown');
  loadSupabaseItems('armor', 'armor-dropdown');
  loadSupabaseItems('equipment', 'equipment-dropdown');

  // Additional event listeners for item lists, theme toggle, printing, tooltips, etc.
});
