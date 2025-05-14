// Supabase setup and Owlbear token sync integration

const speciesAttrs = {};
const roleAttrs = {};
const attrFields = ['dex', 'kno', 'mec', 'per', 'str', 'tec', 'force'];

function updateAttributeDisplay() {
  attrFields.forEach(attr => {
    const el = document.getElementById(`attr-${attr}`);
    if (el) el.value = (speciesAttrs[attr] || 0) + (roleAttrs[attr] || 0);
  });
  updateDerivedStats();
}
      dropdown.innerHTML = '<option value="">-- Select --</option>';
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = JSON.stringify(item);
        option.textContent = item.name;
        dropdown.appendChild(option);
      });

      dropdown.addEventListener('change', () => {
  const selected = dropdown.value;
  if (!selected) return;
  const item = JSON.parse(selected);

  if (dropdownId === 'char-species') {
        attrFields.forEach(attr => {
        const value = parseInt(item[attr]);
        if (!isNaN(value)) {
          speciesAttrs[attr] = value;
        }
      });
      updateAttributeDisplay();
      } else if (dropdownId === 'char-role') {
        attrFields.forEach(attr => {
          const value = parseInt(item[attr]);
        if (!isNaN(value)) {
          roleAttrs[attr] = value;
        }
        });
        updateAttributeDisplay();
      } else if (dropdownId === 'armor-dropdown') {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${item.name}</strong><br>
          Dice: ${item.armor_dice || ''} | Cost: ${item.cost || ''} | Special: ${item.special || ''}
          <button type="button" class="remove-armor">Remove</button>
        `;
        li.classList.add('armor-entry');
        const armorList = document.getElementById('armor-list');
        if (armorList) armorList.appendChild(li);
        li.querySelector('.remove-armor').addEventListener('click', () => li.remove());
      } else if (dropdownId === 'weapon-dropdown') {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${item.name}</strong> [${item.category}]<br>
          Skill: ${item.skill || ''} | Damage: ${item.damage || ''}<br>
          Cost: ${item.cost || ''} | Special: ${item.special || ''}
          <button type="button" class="remove-weapon">Remove</button>
        `;
        li.classList.add('weapon-entry');
        const weaponList = document.getElementById('weapon-list');
        if (weaponList) weaponList.appendChild(li);
        li.querySelector('.remove-weapon').addEventListener('click', () => li.remove());
      } else if (dropdownId === 'equipment-dropdown') {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${item.name}</strong><br>
          Cost: ${item.cost || ''} | Special: ${item.special || ''}
          <button type="button" class="remove-equipment">Remove</button>
        `;
        li.classList.add('equipment-entry');
        const equipmentList = document.getElementById('equipment-list');
        if (equipmentList) equipmentList.appendChild(li);
        li.querySelector('.remove-equipment').addEventListener('click', () => li.remove());
      }
    });
  });
}
let supabase;

function toggleTheme() {
  const body = document.body;
  const btn = document.querySelector('.theme-toggle');
  const isDark = body.classList.toggle('dark');
  body.classList.toggle('light', !isDark);
  if (btn) btn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}



window.addEventListener('DOMContentLoaded', () => {
    const tokenId = new URLSearchParams(window.location.search).get('tokenId');
  if (tokenId) document.body.dataset.tokenId = tokenId;
  supabase = window.supabase.createClient(
    'https://czsplorlrzvanxpwkvru.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c3Bsb3Jscnp2YW54cHdrdnJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNzg3OTUsImV4cCI6MjA2MjY1NDc5NX0.XfJ3e6VlRmyd-ypchibd2jz03hEgZ9m5L1m8o7yFcdY'
  );

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

      dropdown.addEventListener('change', () => {
        const selected = dropdown.value;
        if (!selected) return;
        const item = JSON.parse(selected);

        if (dropdownId === 'char-species') {
          attrFields.forEach(attr => {
            const value = parseInt(item[attr]);
            if (!isNaN(value)) {
              speciesAttrs[attr] = value;
            }
          });
          updateAttributeDisplay();
        } else if (dropdownId === 'char-role') {
          attrFields.forEach(attr => {
            const value = parseInt(item[attr]);
            if (!isNaN(value)) {
              roleAttrs[attr] = value;
            }
          });
          updateAttributeDisplay();
        } else if (dropdownId === 'armor-dropdown') {
          const li = document.createElement('li');
          li.innerHTML = `
            <strong>${item.name}</strong><br>
            Dice: ${item.armor_dice || ''} | Cost: ${item.cost || ''} | Special: ${item.special || ''}
            <button type="button" class="remove-armor">Remove</button>
          `;
          li.classList.add('armor-entry');
          const armorList = document.getElementById('armor-list');
          if (armorList) armorList.appendChild(li);
          li.querySelector('.remove-armor').addEventListener('click', () => li.remove());
        } else if (dropdownId === 'weapon-dropdown') {
          const li = document.createElement('li');
          li.innerHTML = `
            <strong>${item.name}</strong> [${item.category}]<br>
            Skill: ${item.skill || ''} | Damage: ${item.damage || ''}<br>
            Cost: ${item.cost || ''} | Special: ${item.special || ''}
            <button type="button" class="remove-weapon">Remove</button>
          `;
          li.classList.add('weapon-entry');
          const weaponList = document.getElementById('weapon-list');
          if (weaponList) weaponList.appendChild(li);
          li.querySelector('.remove-weapon').addEventListener('click', () => li.remove());
        } else if (dropdownId === 'equipment-dropdown') {
          const li = document.createElement('li');
          li.innerHTML = `
            <strong>${item.name}</strong><br>
            Cost: ${item.cost || ''} | Special: ${item.special || ''}
            <button type="button" class="remove-equipment">Remove</button>
          `;
          li.classList.add('equipment-entry');
          const equipmentList = document.getElementById('equipment-list');
          if (equipmentList) equipmentList.appendChild(li);
          li.querySelector('.remove-equipment').addEventListener('click', () => li.remove());
        }
      });
    });
  }

  // all supabase-dependent calls now run AFTER initialization
  if (!window.supabase) {
    console.error('Supabase not initialized. Aborting data load.');
    return;
  }

  loadSupabaseItems('roles', 'char-role');
  setupLockableField('char-role');
  loadSupabaseItems('species', 'char-species');
  setupLockableField('char-species');
  loadSupabaseItems('edges', 'char-edge');
  loadSupabaseItems('burdens', 'char-burden');
  loadSupabaseItems('weapons', 'weapon-dropdown');
  loadSupabaseItems('armor', 'armor-dropdown');
  loadSupabaseItems('equipment', 'equipment-dropdown');
  if (typeof loadEncounters === 'function') loadEncounters();
  loadTooltips();
  syncWithTokenIfAvailable();
  setupLockableField('char-role');
  loadSupabaseItems('species', 'char-species');
  setupLockableField('char-species');
  loadSupabaseItems('edges', 'char-edge');
  loadSupabaseItems('burdens', 'char-burden');
  loadSupabaseItems('weapons', 'weapon-dropdown');
  loadSupabaseItems('armor', 'armor-dropdown');
  loadSupabaseItems('equipment', 'equipment-dropdown');
  if (typeof loadEncounters === 'function') loadEncounters();
  loadTooltips();
  syncWithTokenIfAvailable();
});

function syncWithTokenIfAvailable() {
  const tokenId = document.body.dataset.tokenId;
  if (!tokenId) return;
  supabase.from('characters').select('*').eq('token_id', tokenId).single().then(({ data }) => {
    if (data && data.sheet) {
      const sheet = JSON.parse(data.sheet);
      for (let key in sheet) {
        const el = document.getElementById(key);
        if (el) el.value = sheet[key];
      }
      updateDerivedStats();
    }
  });
}

function saveToSupabase() {
  const tokenId = document.body.dataset.tokenId;
  if (!tokenId) return alert('No token ID found.');
  const formData = new FormData(document.getElementById('character-form'));
  const sheet = {};
  for (let [key, val] of formData.entries()) sheet[key] = val;
  const data = { token_id: tokenId, sheet: JSON.stringify(sheet) };
  supabase.from('characters').upsert(data).then(({ error }) => {
    if (error) alert('Save failed: ' + error.message);
    else alert('Character saved to Supabase.');
  });
}

const attrMap = {
  agility: 'dex', blasters: 'dex', melee: 'dex', steal: 'dex', throw: 'dex',
  galaxy: 'kno', streetwise: 'kno', survival: 'kno', willpower: 'kno', xenology: 'kno',
  astrogation: 'mec', drive: 'mec', gunnery: 'mec', pilot: 'mec', sensors: 'mec',
  deceive: 'per', hide: 'per', persuade: 'per', search: 'per', tactics: 'per',
  athletics: 'str', brawl: 'str', intimidate: 'str', stamina: 'str', swim: 'str',
  armament: 'tec', computers: 'tec', droids: 'tec', medicine: 'tec', vehicles: 'tec',
  alter: 'force', control: 'force', sense: 'force'
};

function updateTotalDice(skillId) {
  const skill = parseInt(document.getElementById(`skill-${skillId}`).value || 0);
  const attr = attrMap[skillId] || 'dex';
  const attrVal = parseInt(document.getElementById(`attr-${attr}`).value || 0);
  const total = `${attrVal}D${skill > 0 ? '+' + skill : ''}`;
  const totalEl = document.getElementById(`total-${skillId}`);
  if (totalEl) totalEl.textContent = total;
  updateDerivedStats();
}

function rollDiceWithDestiny(skillId) {
  const skill = parseInt(document.getElementById(`skill-${skillId}`).value || 0);
  const attr = attrMap[skillId] || 'dex';
  const attrVal = parseInt(document.getElementById(`attr-${attr}`).value || 0);
  const totalDice = attrVal;
  const destinyDie = Math.ceil(Math.random() * 6);
  let rolls = [destinyDie];
  for (let i = 1; i < totalDice; i++) rolls.push(Math.ceil(Math.random() * 6));
  let total = rolls.reduce((a, b) => a + b, 0);

  let log = `Destiny Die: ${destinyDie}`;
  if (destinyDie === 6) {
    const explode = Math.ceil(Math.random() * 6);
    total += explode;
    log += ` (explodes for +${explode})`;
  }
  alert(`Rolls: ${rolls.join(', ')}\n${log}\nTotal: ${total}`);
}

function updateDerivedStats() {
  applyWoundStatusModifiers();

  const str = parseInt(document.getElementById('attr-str')?.value || 1);
  const dex = parseInt(document.getElementById('attr-dex')?.value || 1);
  const per = parseInt(document.getElementById('attr-per')?.value || 1);

  const agility = parseInt(document.getElementById('skill-agility')?.value || 0);
  const tactics = parseInt(document.getElementById('skill-tactics')?.value || 0);
  const stamina = parseInt(document.getElementById('skill-stamina')?.value || 0);

  const def = dex + agility + 6;
  const init = per + tactics + 6;
  const res = str + stamina + 6;

  const defEl = document.getElementById('derived-defense');
  const initEl = document.getElementById('derived-initiative');
  const resEl = document.getElementById('derived-resolve');
  const current = document.getElementById('current-resolve');

  if (defEl) defEl.value = def;
  if (initEl) initEl.value = init;
  if (resEl) resEl.value = res;
  if (current && (!current.value || isNaN(parseInt(current.value)))) {
    current.value = res;
  }
}

function applyWoundStatusModifiers() {
  const isStaggered = document.getElementById('status-staggered')?.checked;
  const isStunned = document.getElementById('status-stunned')?.checked;
  const isDowned = document.getElementById('status-downed')?.checked;

  const allSkills = document.querySelectorAll('[id^="skill-"]');
  allSkills.forEach(input => {
    input.disabled = isDowned || isStunned;
    input.classList.remove('staggered');
    if (!isDowned && isStaggered) input.classList.add('staggered');
  });
  const sheet = document.getElementById('character-form');
  sheet.classList.toggle('is-staggered', isStaggered);
  sheet.classList.toggle('is-stunned', isStunned);
  sheet.classList.toggle('is-downed', isDowned);
}

function endTurn() {
  ['status-staggered', 'status-stunned'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  updateDerivedStats();
}

function saveToJSON() {
  const formData = new FormData(document.getElementById('character-form'));
  const data = {};
  for (let [key, val] of formData.entries()) data[key] = val;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'character.json';
  a.click();
  URL.revokeObjectURL(url);
}

function loadFromJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = () => {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result);
      for (let key in data) {
        const el = document.getElementById(key);
        if (el) el.value = data[key];
      }
      updateDerivedStats();
    };
    reader.readAsText(file);
  };
  input.click();
}

function printCharacterSheet() {
  window.print();
}

function saveToCSV() {
  const formData = new FormData(document.getElementById('character-form'));
  let csv = 'Field,Value\n';
  for (let [key, val] of formData.entries()) {
    csv += `${key},${val}\n`;
  }
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'character.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function setupLockableField(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  const wrapper = dropdown.closest('div');
  if (!wrapper) return;

  const setBtn = document.createElement('button');
  setBtn.textContent = 'Set';
  setBtn.type = 'button';

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.type = 'button';
  editBtn.style.display = 'none';

  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear';
  clearBtn.type = 'button';
  clearBtn.style.display = 'none';

  [setBtn, editBtn, clearBtn].forEach(btn => {
    btn.style.marginLeft = '5px';
    btn.classList.add('lock-btn');
    wrapper.appendChild(btn);
  });

  setBtn.addEventListener('click', () => {
    dropdown.disabled = true;
    setBtn.style.display = 'none';
    editBtn.style.display = 'inline-block';
    clearBtn.style.display = 'inline-block';
    wrapper.classList.add('locked');
  });

  editBtn.addEventListener('click', () => {
    dropdown.disabled = false;
    setBtn.style.display = 'inline-block';
    editBtn.style.display = 'none';
    clearBtn.style.display = 'none';
    wrapper.classList.remove('locked');
  });

  clearBtn.addEventListener('click', () => {
    dropdown.disabled = false;
    dropdown.value = '';
    if (dropdownId === 'char-species') {
      attrFields.forEach(attr => delete speciesAttrs[attr]);
    } else if (dropdownId === 'char-role') {
      attrFields.forEach(attr => delete roleAttrs[attr]);
    }
    updateAttributeDisplay();
    setBtn.style.display = 'inline-block';
    editBtn.style.display = 'none';
    clearBtn.style.display = 'none';
    wrapper.classList.remove('locked');
  });
}

function loadTooltips() {
  supabase.from('attributes_skills_tooltips').select('*').then(({ data, error }) => {
    if (error || !data) return console.error('Tooltip load failed:', error);

    data.forEach(({ name, tooltip }) => {
      const safeKey = name.trim().toLowerCase().replace(/[^a-z0-9]/gi, '-');
      const targets = document.querySelectorAll(`[data-tooltip-key="${safeKey}"]`);
      targets.forEach(el => {
        el.setAttribute('title', tooltip);
      });
    });
  });
}

function loadFromCSV(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const lines = reader.result.split('\n').slice(1);
    lines.forEach(line => {
      const [key, val] = line.split(',');
      if (key && val) {
        const el = document.getElementById(key);
        if (el) el.value = val.trim();
      }
    });
    updateDerivedStats();
  };
  reader.readAsText(file);
}
