// Supabase setup and Owlbear token sync integration

let supabase;

// Attribute and skill handling
const speciesAttrs = {};
const roleAttrs = {};
const attrFields = ['dex','kno','mec','per','str','tec','force'];

/**
 * Update attribute inputs and derived stats
 */
function updateAttributeDisplay() {
  attrFields.forEach(attr => {
    const el = document.getElementById(`attr-${attr}`);
    if (el) el.value = (speciesAttrs[attr] || 0) + (roleAttrs[attr] || 0);
  });
  updateDerivedStats();
}

/**
 * Calculate and display derived stats
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
      const option = document.createElement('option');
      option.value = JSON.stringify(item);
      option.textContent = item.name;
      dropdown.appendChild(option);
    });
  });
}

// Helper functions (lockable fields, list additions) omitted for brevity

// Main initialization after DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  const tokenId = new URLSearchParams(window.location.search).get('tokenId');
  if (tokenId) document.body.dataset.tokenId = tokenId;

  // Initialize Supabase client
  supabase = window.supabase.createClient(
    'https://czsplorlrzvanxpwkvru.supabase.co',
    'YOUR_ANON_KEY'
  );

  // Populate character dropdowns and handle selection
  loadSupabaseItems('roles', 'char-role');
  document.getElementById('char-role')?.addEventListener('change', e => {
    const item = JSON.parse(e.target.value || '{}');
    attrFields.forEach(attr => roleAttrs[attr] = parseInt(item[attr]) || 0);
    updateAttributeDisplay();
  });
  setupLockableField('char-role');

  loadSupabaseItems('species', 'char-species');
  document.getElementById('char-species')?.addEventListener('change', e => {
    const item = JSON.parse(e.target.value || '{}');
    attrFields.forEach(attr => speciesAttrs[attr] = parseInt(item[attr]) || 0);
    updateAttributeDisplay();
  });
  setupLockableField('char-species');

  loadSupabaseItems('edges', 'char-edge');
  loadSupabaseItems('burdens', 'char-burden');

  // Populate dropdowns and hook change events for items...
  loadSupabaseItems('weapons', 'weapon-dropdown');
  document.getElementById('weapon-dropdown')?.addEventListener('change', e => {
    const item = JSON.parse(e.target.value || '{}');
    if (item) addWeaponToList(item);
  });

  loadSupabaseItems('armor', 'armor-dropdown');
  document.getElementById('armor-dropdown')?.addEventListener('change', e => {
    const item = JSON.parse(e.target.value || '{}');
    if (item) addArmorToList(item);
  });

  loadSupabaseItems('equipment', 'equipment-dropdown');
  document.getElementById('equipment-dropdown')?.addEventListener('change', e => {
    const item = JSON.parse(e.target.value || '{}');
    if (item) addEquipmentToList(item);
  });

  // Initialize derived stats
  updateAttributeDisplay();

  // Load tooltips and sync existing character if token provided
  if (typeof loadTooltips === 'function') loadTooltips();
  if (typeof syncWithTokenIfAvailable === 'function') syncWithTokenIfAvailable();
});
