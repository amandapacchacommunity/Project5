async function loadData() {
  const res = await fetch('data.json');
  return await res.json();
}

function buildKPIs(kpis) {
  const root = document.getElementById('kpis');
  root.innerHTML = '';
  kpis.forEach(k => {
    const el = document.createElement('div');
    el.className = 'kpi';
    el.innerHTML = `<div class="label">${k.label}</div><div class="value">${k.value}</div><div class="detail">${k.detail}</div>`;
    root.appendChild(el);
  });
}

function lineChart(id, labels, datasets) {
  new Chart(document.getElementById(id), {
    type: 'line',
    data: { labels, datasets: datasets.map(d => ({...d, tension: 0.3, fill: false})) },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function barChart(id, labels, data) {
  new Chart(document.getElementById(id), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Count', data }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

function buildContracts(items) {
  const root = document.getElementById('contracts');
  root.innerHTML = '';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'contract-card';
    el.innerHTML = `
      <div class="contract-top">
        <div>
          <strong>${item.name}</strong>
          <div class="small">Review date: ${item.review_date} · Deadline: ${item.deadline}</div>
        </div>
        <span class="status">${item.status}</span>
      </div>
      <p><strong>Flag:</strong> ${item.flag}</p>
      <p class="small">${item.note}</p>
    `;
    root.appendChild(el);
  });
}

function buildIncidentTable(items) {
  const tbody = document.querySelector('#incidentTable tbody');
  tbody.innerHTML = '';
  items.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row[0]}</td>
      <td>${row[1]}</td>
      <td>${row[2]}</td>
      <td>${row[3]}</td>
      <td><span class="status">${row[4]}</span></td>
      <td>${row[5]}</td>
      <td>${row[6]}</td>
    `;
    tbody.appendChild(tr);
  });
}

function wireSearch(allRows) {
  const box = document.getElementById('searchBox');
  box.addEventListener('input', () => {
    const q = box.value.trim().toLowerCase();
    const filtered = allRows.filter(row => row.join(' ').toLowerCase().includes(q));
    buildIncidentTable(filtered);
  });
}

function formatPct(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

function riskBand(score) {
  if (score >= 74) return 'high';
  if (score >= 52) return 'moderate';
  return 'low';
}

function updateForecast() {
  const inputs = {
    enrollmentPressure: Number(document.getElementById('enrollmentPressure').value),
    claimsFrequency: Number(document.getElementById('claimsFrequency').value),
    contractorInflation: Number(document.getElementById('contractorInflation').value),
    controlImprovement: Number(document.getElementById('controlImprovement').value),
    complianceReadiness: Number(document.getElementById('complianceReadiness').value),
    capitalActivity: Number(document.getElementById('capitalActivity').value)
  };

  Object.keys(inputs).forEach(id => {
    document.getElementById(id + 'Val').textContent = formatPct(inputs[id]);
  });

  const workersCompChange = Math.round((inputs.claimsFrequency * 0.9) + (inputs.capitalActivity * 0.25) - (inputs.controlImprovement * 0.6));
  const contractorCostChange = Math.round((inputs.contractorInflation * 1.1) + (inputs.capitalActivity * 0.5) + (inputs.enrollmentPressure * 0.2));
  const laborCostChange = Math.round((inputs.enrollmentPressure * 0.6) + (inputs.complianceReadiness * 0.2) + (inputs.capitalActivity * 0.2));
  const impactScore = Math.max(20, Math.min(95, Math.round(50 + inputs.claimsFrequency * 1.1 + inputs.contractorInflation * 0.9 + inputs.capitalActivity * 0.5 - inputs.controlImprovement * 1.2)));
  const likelihoodScore = Math.max(15, Math.min(95, Math.round(48 + inputs.enrollmentPressure * 0.8 + inputs.claimsFrequency * 1.0 + inputs.contractorInflation * 0.5 - inputs.controlImprovement * 0.9 - inputs.complianceReadiness * 0.4)));

  const impactBand = riskBand(impactScore);
  const likelihoodBand = riskBand(likelihoodScore);

  document.getElementById('forecastSentence').textContent =
    `Under this synthetic scenario, projected workers’ compensation costs move ${workersCompChange >= 0 ? 'up' : 'down'} ${Math.abs(workersCompChange)}%, contractor spending moves ${contractorCostChange >= 0 ? 'up' : 'down'} ${Math.abs(contractorCostChange)}%, and the overall risk profile shifts toward ${impactBand} impact with ${likelihoodBand} likelihood.`;

  const metrics = [
    ['Workers’ comp cost change', formatPct(workersCompChange)],
    ['Contractor cost change', formatPct(contractorCostChange)],
    ['Labor-related cost change', formatPct(laborCostChange)],
    ['Impact score', `${impactScore} / 100`],
    ['Likelihood score', `${likelihoodScore} / 100`]
  ];

  const root = document.getElementById('forecastMetrics');
  root.innerHTML = '';
  metrics.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'metric-row';
    row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    root.appendChild(row);
  });
}

loadData().then(data => {
  buildKPIs(data.kpis);

  lineChart('costChart', data.costTrends.labels, [
    { label: 'Workers’ comp cost', data: data.costTrends.workersComp },
    { label: 'Contractor cost', data: data.costTrends.contractor },
    { label: 'Labor-related cost', data: data.costTrends.labor }
  ]);

  lineChart('rateChart', data.rateTrends.labels, [
    { label: 'Workers’ comp rate', data: data.rateTrends.workersCompRate },
    { label: 'Avg contractor rate', data: data.rateTrends.contractorRate },
    { label: 'Labor rate index', data: data.rateTrends.laborRateIndex }
  ]);

  barChart('incidentChart', data.incidentSummary.labels, data.incidentSummary.counts);
  buildContracts(data.contracts);
  buildIncidentTable(data.incidents);
  wireSearch(data.incidents);

  ['enrollmentPressure','claimsFrequency','contractorInflation','controlImprovement','complianceReadiness','capitalActivity']
    .forEach(id => document.getElementById(id).addEventListener('input', updateForecast));

  updateForecast();
});
