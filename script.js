
const money = (v) => `$${v.toFixed(2)}M`;

async function init() {
  const res = await fetch('data.json');
  const data = await res.json();

  document.getElementById('wcSpend').textContent = money(data.kpis.workersCompSpendM);
  document.getElementById('wcYoY').textContent = `${data.kpis.workersCompYoY}% YoY`;
  document.getElementById('contractorSpend').textContent = money(data.kpis.contractorSpendM);
  document.getElementById('contractorYoY').textContent = `${data.kpis.contractorYoY}% YoY`;
  document.getElementById('unionSpend').textContent = money(data.kpis.unionSpendM);
  document.getElementById('unionYoY').textContent = `${data.kpis.unionYoY}% YoY`;
  document.getElementById('incidentTotal').textContent = data.kpis.totalIncidents.toLocaleString();
  document.getElementById('openHigh').textContent = `${data.kpis.openHighPriority} open high / critical incidents`;
  document.getElementById('reviewsDue').textContent = data.kpis.upcomingReviews60;

  new Chart(document.getElementById('costTrend'), {
    type: 'line',
    data: {
      labels: data.years,
      datasets: [
        { label: "Workers' Comp", data: data.costs.workersComp, tension: .3, borderWidth: 3 },
        { label: "Contractor", data: data.costs.contractor, tension: .3, borderWidth: 3 },
        { label: "Union", data: data.costs.union, tension: .3, borderWidth: 3 }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom'}} }
  });

  new Chart(document.getElementById('rateTrend'), {
    type: 'line',
    data: {
      labels: data.years,
      datasets: [
        { label: "Workers' Comp Rate", data: data.rates.workersCompRate, tension: .3, borderWidth: 3, yAxisID:'y' },
        { label: "Contractor Avg Hourly Rate", data: data.rates.contractorRate, tension: .3, borderWidth: 3, yAxisID:'y1' },
        { label: "Union Avg Hourly Rate", data: data.rates.unionRate, tension: .3, borderWidth: 3, yAxisID:'y1' }
      ]
    },
    options: {
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{position:'bottom'}},
      scales:{
        y:{position:'left', title:{display:true, text:"WC rate"}},
        y1:{position:'right', grid:{drawOnChartArea:false}, title:{display:true, text:"Hourly rate ($)"}}
      }
    }
  });

  const incidentTypes = Object.keys(data.monthlyIncidents);
  const monthlyLabels = Object.keys(data.monthlyIncidents[incidentTypes[0]]).length ? Object.keys(data.monthlyIncidents) : null;

  new Chart(document.getElementById('incidentStack'), {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: incidentTypes.map(t => ({
        label: t,
        data: data.monthlyIncidents[t],
        borderWidth: 1
      }))
    },
    options: {
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{position:'bottom'}},
      scales:{x:{stacked:true},y:{stacked:true}}
    }
  });

  new Chart(document.getElementById('severityMix'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(data.severityCounts),
      datasets: [{ data: Object.values(data.severityCounts), borderWidth: 1 }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom'}} }
  });

  const contractBody = document.querySelector('#contractsTable tbody');
  data.contracts
    .sort((a,b) => a.daysRemaining - b.daysRemaining)
    .forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${row.name}</strong></td>
        <td>${row.owner}</td>
        <td>${row.reviewDate}</td>
        <td>${row.daysRemaining}</td>
        <td><span class="badge ${row.risk.toLowerCase()}">${row.risk}</span></td>
        <td><span class="badge ${row.flag.toLowerCase().replace(/\s/g,'')}">${row.flag}</span></td>
        <td>${row.note}</td>
      `;
      contractBody.appendChild(tr);
    });

  const incidents = data.incidentLog;
  const incidentsBody = document.querySelector('#incidentsTable tbody');

  function renderIncidents(rows){
    incidentsBody.innerHTML = '';
    rows.slice(0, 150).forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.id}</td>
        <td>${r.opened}</td>
        <td>${r.type}</td>
        <td><span class="badge ${r.severity.toLowerCase()}">${r.severity}</span></td>
        <td>${r.status}</td>
        <td>${r.owner}</td>
        <td>${r.targetDate}</td>
        <td>${r.summary}</td>
      `;
      incidentsBody.appendChild(tr);
    });
  }
  renderIncidents(incidents);

  document.getElementById('incidentSearch').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if(!q) return renderIncidents(incidents);
    renderIncidents(incidents.filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(q))
    ));
  });
}
init();
