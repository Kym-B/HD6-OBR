// Supabase setup and Owlbear token sync integration

let supabase;

/**
 * Fetches items from a Supabase table and populates a dropdown.
 * Must be declared before calling anywhere in this script.
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

/**
 * Sets up lock and unlock buttons for a dropdown field.
 * Disables the dropdown when locked, and shows an edit button.
 */
function setupLockableField(fieldId) {
  const dropdown = document.getElementById(fieldId);
  const lockBtn = document.getElementById(`lock-${fieldId}`);
  const editBtn = document.getElementById(`edit-${fieldId}`);
  if (!dropdown || !lockBtn || !editBtn) return;

  lockBtn.style.display = 'none';  // Initially hide lock button
  editBtn.style.display = 'inline-block';  // Show edit by default

  lockBtn.addEventListener('click', () => {
    dropdown.disabled = false;
    lockBtn.style.display = 'none';
    editBtn.style.display = 'inline-block';
  });

  editBtn.addEventListener('click', () => {
    dropdown.disabled = true;
    editBtn.style.display = 'none';
    lockBtn.style.display = 'inline-block';
  });
}

/**
 * Adds an armor item to the armor list with a remove button.
 * Ensure addArmorToList is defined before dropdown change handler below.
 */
function addArmorToList(item) {
  const list = document.getElementById('armor-list');
  if (!list) return;
  const li = document.createElement('li');
  li.innerHTML = `
    <strong>${item.name}</strong><br>
    Dice: ${item.armor_dice || ''} | Cost: ${item.cost || ''} | Special: ${item.special || ''}
    <button type="button" class="remove-armor">Remove</button>
  `;
  li.classList.add('armor-entry');
  li.querySelector('.remove-armor').addEventListener('click', () => li.remove());
  list.appendChild(li);
}

/**
 * Adds a weapon item to the weapon list with a remove button.
 * Ensure addWeaponToList is defined before dropdown change handler below.
 */
function addWeaponToList(item) {
  const list = document.getElementById('weapon-list');
  if (!list) return;
  const li = document.createElement('li');
  li.innerHTML = `
    <strong>${item.name}</strong> [${item.category}]<br>
    Skill: ${item.skill || ''} | Damage: ${item.damage || ''}<br>
    Cost: ${item.cost || ''} | Special: ${item.special || ''}
    <button type="button" class="remove-weapon">Remove</button>
  `;
  li.classList.add('weapon-entry');
  li.querySelector('.remove-weapon').addEventListener('click', () => li.remove());
  list.appendChild(li);
}

/**
 * Adds an equipment item to the equipment list with a remove button.
 * Ensure addEquipmentToList is defined before dropdown change handler below.
 */
function addEquipmentToList(item) {
  const list = document.getElementById('equipment-list');
  if (!list) return;
  const li = document.createElement('li');
  li.innerHTML = `
    <strong>${item.name}</strong><br>
    Cost: ${item.cost || ''} | Special: ${item.special || ''}
    <button type="button" class="remove-equipment">Remove</button>
  `;
  li.classList.add('equipment-entry');
  li.querySelector('.remove-equipment').addEventListener('click', () => li.remove());
  list.appendChild(li);
}

// Main initialization after DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  const tokenId = new URLSearchParams(window.location.search).get('tokenId');
  if (tokenId) document.body.dataset.tokenId = tokenId;

  // Initialize Supabase client
  supabase = window.supabase.createClient(
    'https://czsplorlrzvanxpwkvru.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c3Bsb3Jscnp2YW54cHdrdnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzg3OTUsImV4cCI6MjA2MjY1NDc5NX0.XfJ3e6VlRmyd-ypchibd2jz03hEgZ9m5L1m8o7yFcdY'
  );

  // Populate character dropdowns
  loadSupabaseItems('roles', 'char-role');
  setupLockableField('char-role');
  loadSupabaseItems('species', 'char-species');
  setupLockableField('char-species');
  loadSupabaseItems('edges', 'char-edge');
  loadSupabaseItems('burdens', 'char-burden');

  // Populate weapon, armor, equipment dropdowns and hook change events
  loadSupabaseItems('weapons', 'weapon-dropdown');
  document.getElementById('weapon-dropdown')?.addEventListener('change', e => {
    const item = JSON.parse(e.target.value);
    if (item) addWeaponToList(item);
  });

  loadSupabaseItems('armor', 'armor-dropdown');
  document.getElementById('armor-dropdown')?.addEventListener('change', e => {
    const item = JSON.parse(e.target.value);
    if (item) addArmorToList(item);
  });

  loadSupabaseItems('equipment', 'equipment-dropdown');
  document.getElementById('equipment-dropdown')?.addEventListener('change', e => {
    const item = JSON.parse(e.target.value);
    if (item) addEquipmentToList(item);
  });

  // Load tooltips and sync existing character if token provided
  if (typeof loadTooltips === 'function') loadTooltips();
  if (typeof syncWithTokenIfAvailable === 'function') syncWithTokenIfAvailable();
});
