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

loadData().then(data => {
  buildKPIs(data.kpis);

  lineChart('costChart', data.costTrends.labels, [
    { label: 'Workers’ comp cost', data: data.costTrends.workersComp },
    { label: 'Contractor cost', data: data.costTrends.contractor },
    { label: 'Union-related cost', data: data.costTrends.union }
  ]);

  lineChart('rateChart', data.rateTrends.labels, [
    { label: 'Workers’ comp rate', data: data.rateTrends.workersCompRate },
    { label: 'Avg contractor rate', data: data.rateTrends.contractorRate },
    { label: 'Illustrative labor rate index', data: data.rateTrends.unionRate }
  ]);

  barChart('incidentChart', data.incidentSummary.labels, data.incidentSummary.counts);
  buildContracts(data.contracts);
  buildIncidentTable(data.incidents);
  wireSearch(data.incidents);
});
