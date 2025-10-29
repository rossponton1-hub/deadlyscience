const deadlyConfigPromise = fetch('config/enums.json').then(resp => resp.json()).then(cfg => {
  window.DEADLY_CONFIG = cfg;
  return cfg;
});

async function loadDeadlyConfig() {
  if (window.DEADLY_CONFIG) {
    return window.DEADLY_CONFIG;
  }
  return deadlyConfigPromise;
}

function buildTooltipIcon(text) {
  const span = document.createElement('span');
  span.className = 'tooltip';
  span.setAttribute('data-tooltip', text);
  span.textContent = 'ⓘ';
  return span;
}

async function renderUniversalDateFilter(containerId, options = {}) {
  const cfg = await loadDeadlyConfig();
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return cfg;

  const wrapper = document.createElement('div');
  wrapper.className = 'filter-shell';

  const heading = document.createElement('div');
  heading.className = 'filter-heading';
  const label = document.createElement('span');
  label.textContent = 'Date Range';
  heading.appendChild(label);
  heading.appendChild(buildTooltipIcon(`Presets align to ${cfg.timezone} and apply calendar days.`));

  const chipRow = document.createElement('div');
  chipRow.className = 'chip-row';
  cfg.datePresets.forEach((preset, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.dataset.key = preset.key;
    btn.textContent = preset.label;
    btn.appendChild(buildTooltipIcon(`${preset.description} • Timezone: ${cfg.timezone}`));
    if (!options.defaultPreset && index === 0) {
      btn.classList.add('active');
    }
    if (options.defaultPreset && options.defaultPreset === preset.key) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      chipRow.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      if (typeof options.onPresetChange === 'function') {
        options.onPresetChange(preset.key);
      }
      customWrapper.classList.toggle('active', preset.key === 'Custom_Range');
    });
    chipRow.appendChild(btn);
  });

  const customWrapper = document.createElement('div');
  customWrapper.className = 'custom-range';
  customWrapper.innerHTML = `
    <label>Custom Range</label>
    <div class="custom-inputs">
      <input type="date" id="CustomRangeStart" aria-label="Custom range start"/>
      <input type="date" id="CustomRangeEnd" aria-label="Custom range end"/>
    </div>
  `;

  wrapper.appendChild(heading);
  wrapper.appendChild(chipRow);
  wrapper.appendChild(customWrapper);
  container.innerHTML = '';
  container.appendChild(wrapper);

  return cfg;
}

function createStatusChip(value, tooltip, tone = 'neutral') {
  const chip = document.createElement('span');
  chip.className = `status-chip tone-${tone}`;
  chip.textContent = value;
  chip.appendChild(buildTooltipIcon(tooltip));
  return chip;
}

window.loadDeadlyConfig = loadDeadlyConfig;
window.renderUniversalDateFilter = renderUniversalDateFilter;
window.createStatusChip = createStatusChip;
window.buildTooltipIcon = buildTooltipIcon;
