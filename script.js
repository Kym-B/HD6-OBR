// Supabase setup and Owlbear token sync integration

let supabase;

// Track base attribute values from Species and Role
const speciesAttrs = {};
const roleAttrs = {};
const attrFields = ['dex','kno','mec','per','str','tec','force'];

// This function sums 'speciesAttrs' and 'roleAttrs' for each attribute input, ensuring base values update correctly, then calls updateDerivedStats to refresh derived scores.
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

// Derived stats are recalculated here using current attribute and skill inputs, and the Current Resolve is initialized if empty.
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

// This function cleanly encapsulates fetching data from Supabase and populating dropdowns.
// Because it’s declared before any calls, dropdown menus load without errors.
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

// Set up a dropdown field with lock/edit buttons.
function setupLockableField(fieldId) {
  const dropdown = document.getElementById(fieldId);
  const lockBtn = document.getElementById(`lock-${fieldId}`);
  const editBtn = document.getElementById(`edit-${fieldId}`);
  if (!dropdown || !lockBtn || !editBtn) return;
  editBtn.style.display = 'none';
  lockBtn.style.display = 'inline-block';
  lockBtn.addEventListener('click', () => {
    dropdown.disabled = true;
    lockBtn.style.display = 'none';
    editBtn.style.display = 'inline-block';
  });
  editBtn.addEventListener('click', () => {
    dropdown.disabled = false;
    editBtn.style.display = 'none';
    lockBtn.style.display = 'inline-block';
  });
}

// Add an armor item to the list with remove functionality.
function addArmorToList(item) {
  const list = document.getElementById('armor-list');
  if (!list) return;
  const li = document.createElement('li');
  li.innerHTML = `
    <strong>${item.name}</strong><br>
    Dice: ${item.armor_dice||''} | Cost: ${item.cost||''} | Special: ${item.special||''}
    <button type="button" class="remove-armor">Remove</button>
  `;
  li.querySelector('.remove-armor').addEventListener('click',()=>li.remove());
  list.appendChild(li);
}

// Add a weapon item to the list with remove functionality.
function addWeaponToList(item) {
  const list = document.getElementById('weapon-list');
  if (!list) return;
  const li = document.createElement('li');
  li.innerHTML = `
    <strong>${item.name}</strong> [${item.category}]<br>
    Skill: ${item.skill||''} | Damage: ${item.damage||''}<br>
    Cost: ${item.cost||''} | Special: ${item.special||''}
    <button type="button" class="remove-weapon">Remove</button>
  `;
  li.querySelector('.remove-weapon').addEventListener('click',()=>li.remove());
  list.appendChild(li);
}

// Add an equipment item to the list with remove functionality.
function addEquipmentToList(item) {
  const list = document.getElementById('equipment-list');
  if (!list) return;
  const li = document.createElement('li');
  li.innerHTML = `
    <strong>${item.name}</strong><br>
    Cost: ${item.cost||''} | Special: ${item.special||''}
    <button type="button" class="remove-equipment">Remove</button>
  `;
  li.querySelector('.remove-equipment').addEventListener('click',()=>li.remove());
  list.appendChild(li);
}

// Toggle between dark and light themes.
function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.toggle('dark');
  body.classList.toggle('light', !isDark);
  document.querySelector('.theme-toggle')?.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

// Print the character sheet.
function printSheet() {
  window.print();
}

// Save current sheet to JSON file.
function saveToJSON() {
  const formData = new FormData(document.getElementById('character-form'));
  const data = {};
  formData.forEach((val,key)=>data[key]=val);
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='character.json'; a.click(); URL.revokeObjectURL(url);
}

// Load sheet from JSON file.
function loadFromJSON() {
  const input=document.createElement('input'); input.type='file'; input.accept='application/json';
  input.onchange=()=>{
    const reader=new FileReader(); reader.onload=()=>{
      const data=JSON.parse(reader.result);
      Object.keys(data).forEach(key=>{const el=document.getElementById(key); if(el) el.value=data[key];});
      updateAttributeDisplay();
    };
    reader.readAsText(input.files[0]);
  };
  input.click();
}

// Save current sheet to CSV file.
function saveToCSV() {
  const formData = new FormData(document.getElementById('character-form'));
  let csv='Field,Value\n';
  formData.forEach((val,key)=>csv+=`${key},${val}\n`);
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='character.csv'; a.click(); URL.revokeObjectURL(url);
}

// Load sheet from CSV file.
function loadFromCSV(event) {
  const reader=new FileReader(); reader.onload=()=>{
    reader.result.split('\n').slice(1).forEach(line=>{const [key,val]=line.split(',');const el=document.getElementById(key); if(el) el.value=val.trim();});
    updateAttributeDisplay();
  };
  reader.readAsText(event.target.files[0]);
}

// Load tooltips for attributes and skills from Supabase.
function loadTooltips() {
  supabase.from('attributes_skills_tooltips').select('name,tooltip').then(({data})=>{
    data.forEach(item=>{
      const el=document.querySelector(`[data-tooltip="${item.name}"]`);
      if(el) el.title=item.tooltip;
    });
  });
}

// Sync with Owlbear token if provided and load saved sheet.
function syncWithTokenIfAvailable() {
  const tokenId = document.body.dataset.tokenId;
  if (!tokenId) return;
  supabase.from('characters').select('sheet').eq('token_id', tokenId).single().then(({data})=>{
    if(data?.sheet) {
      const sheet = JSON.parse(data.sheet);
      Object.keys(sheet).forEach(key=>{const el=document.getElementById(key); if(el) el.value=sheet[key];});
      updateAttributeDisplay();
    }
  });
}

// Main initialization after DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  // Initialize Supabase client (must remain exactly as-is)
  supabase = window.supabase.createClient(
    'https://czsplorlrzvanxpwkvru.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c3Bsb3Jscnp2YW54cHdrdnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzg3OTUsImV4cCI6MjA2MjY1NDc5NX0.XfJ3e6VlRmyd-ypchibd2jz03hEgZ9m5L1m8o7yFcdY'
  );

  // Populate Species dropdown
  loadSupabaseItems('species', 'char-species');
  document.getElementById('char-species')?.addEventListener('change', e => {
    const item = JSON.parse(e.target.value||'{}');
    attrFields.forEach(attr=>speciesAttrs[attr]=parseInt(item[attr])||0);
    updateAttributeDisplay();
  });
  setupLockableField('char-species');

  // Populate Role dropdown
  loadSupabaseItems('roles', 'char-role');
  document.getElementById('char-role')?.addEventListener('change', e => {
    const item = JSON.parse(e.target.value||'{}');
    attrFields.forEach(attr=>roleAttrs[attr]=parseInt(item[attr])||0);
    updateAttributeDisplay();
  });
  setupLockableField('char-role');

  // Derived stats initial
  updateAttributeDisplay();

  // Populate other dropdowns
  loadSupabaseItems('edges', 'char-edge');
  loadSupabaseItems('burdens', 'char-burden');
  loadSupabaseItems('weapons', 'weapon-dropdown');
  loadSupabaseItems('armor', 'armor-dropdown');
  loadSupabaseItems('equipment', 'equipment-dropdown');

  // Item addition listeners
  document.getElementById('weapon-dropdown')?.addEventListener('change', e => { addWeaponToList(JSON.parse(e.target.value||'{}')); });
  document.getElementById('armor-dropdown')?.addEventListener('change', e => { addArmorToList(JSON.parse(e.target.value||'{}')); });
  document.getElementById('equipment-dropdown')?.addEventListener('change', e => { addEquipmentToList(JSON.parse(e.target.value||'{}')); });

  // Theme toggle button
  document.querySelector('.theme-toggle')?.addEventListener('click', toggleTheme);

  // Print, save/load handlers
  document.getElementById('print-btn')?.addEventListener('click', printSheet);
  document.getElementById('save-json-btn')?.addEventListener('click', saveToJSON);
  document.getElementById('load-json-btn')?.addEventListener('click', loadFromJSON);
  document.getElementById('save-csv-btn')?.addEventListener('click', saveToCSV);
  document.getElementById('load-csv-input')?.addEventListener('change', loadFromCSV);

  // Load tooltips and sync sheet
  loadTooltips();
  syncWithTokenIfAvailable();
});
