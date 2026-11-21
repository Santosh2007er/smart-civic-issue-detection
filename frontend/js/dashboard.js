/**
 * Admin Dashboard & Municipal Analytics Module
 * Integrates Chart.js visualizations, Leaflet GIS mapping, & Status Lifecycle Controls
 * Team: DYNAMIC TRIO | Rajalakshmi Institute of Technology
 */

let adminMap = null;
let categoryChart = null;
let statusChart = null;
let severityChart = null;
let markersLayer = null;
let currentComplaintsList = [];

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

async function initDashboard() {
  await fetchStats();
  await loadComplaintsTable();
  initAdminMap();
}

// 1. Fetch Dashboard Analytics KPIs & Charts
async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/complaints/stats`);
    const json = await res.json();

    if (json.success && json.data) {
      const stats = json.data;
      // Update KPI Counter Cards
      const totalEl = document.getElementById('stat-total');
      const pendingEl = document.getElementById('stat-pending');
      const resolvedEl = document.getElementById('stat-resolved');
      const highEl = document.getElementById('stat-high');

      if (totalEl) totalEl.textContent = stats.total;
      if (pendingEl) pendingEl.textContent = stats.pending;
      if (resolvedEl) resolvedEl.textContent = stats.resolved;
      if (highEl) highEl.textContent = stats.highPriority;

      // Render Chart.js Visual Graphs
      renderCategoryChart(stats.categories);
      renderStatusChart(stats.statuses);
      renderSeverityChart(stats.severities);
    }
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
  }
}

// 2. Chart.js Implementations
function renderCategoryChart(catData) {
  const ctx = document.getElementById('chart-categories');
  if (!ctx) return;

  if (categoryChart) categoryChart.destroy();

  const labels = Object.keys(catData);
  const counts = Object.values(catData);

  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: counts,
        backgroundColor: ['#ef4444', '#10b981', '#f97316', '#8b5cf6'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, padding: 14, font: { family: 'Inter', size: 11 } }
        }
      },
      cutout: '65%'
    }
  });
}

function renderStatusChart(statusData) {
  const ctx = document.getElementById('chart-statuses');
  if (!ctx) return;

  if (statusChart) statusChart.destroy();

  const labels = Object.keys(statusData);
  const counts = Object.values(statusData);

  statusChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Complaints',
        data: counts,
        backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 }
        },
        x: {
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function renderSeverityChart(sevData) {
  const ctx = document.getElementById('chart-severities');
  if (!ctx) return;

  if (severityChart) severityChart.destroy();

  severityChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['High', 'Medium', 'Low'],
      datasets: [{
        data: [sevData.High || 0, sevData.Medium || 0, sevData.Low || 0],
        backgroundColor: ['#dc2626', '#f59e0b', '#10b981'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, padding: 12, font: { family: 'Inter', size: 11 } }
        }
      }
    }
  });
}

// 3. Load Complaints Table with Dynamic Filtering
async function loadComplaintsTable() {
  const tbody = document.getElementById('complaints-table-body');
  if (!tbody) return;

  const search = document.getElementById('filter-search') ? document.getElementById('filter-search').value : '';
  const category = document.getElementById('filter-category') ? document.getElementById('filter-category').value : '';
  const status = document.getElementById('filter-status') ? document.getElementById('filter-status').value : '';
  const severity = document.getElementById('filter-severity') ? document.getElementById('filter-severity').value : '';

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Loading complaints...</td></tr>`;

  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    if (severity) params.append('severity', severity);

    const res = await fetch(`${API_BASE}/complaints?${params.toString()}`);
    const json = await res.json();

    if (json.success && json.data) {
      currentComplaintsList = json.data;
      renderTableRows(currentComplaintsList);
      updateMapMarkers(currentComplaintsList);
    }
  } catch (err) {
    console.error('Error fetching complaints list:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--danger);">Failed to load complaints.</td></tr>`;
  }
}

function renderTableRows(complaints) {
  const tbody = document.getElementById('complaints-table-body');
  if (!tbody) return;

  if (complaints.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No complaints match the filter criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = complaints.map(c => {
    const statusCode = (c.status_code || c.status_name || 'submitted').toLowerCase().replace(/\s+/g, '_');
    const severityCode = (c.severity || 'Medium').toLowerCase();
    const dateFormatted = new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return `
      <tr>
        <td>
          <a href="track.html?id=${c.tracking_id}" style="font-weight: 700; color: var(--primary);">
            ${c.tracking_id}
          </a>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${c.title}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);"><i class="fas fa-map-marker-alt"></i> ${c.address}</div>
        </td>
        <td>
          <span style="font-weight: 500;">${c.category_name}</span>
          ${c.ai_confidence ? `<span style="font-size: 0.72rem; color: var(--success); display:block;">AI: ${c.ai_confidence}%</span>` : ''}
        </td>
        <td>
          <span class="badge badge-${severityCode}">
            ${c.severity}
          </span>
        </td>
        <td>
          <!-- Instant Inline Status Change Dropdown -->
          <select class="form-control" style="padding: 4px 8px; font-size: 0.82rem; width: auto; font-weight: 600;" onchange="updateStatusInline(${c.id || `'${c.tracking_id}'`}, this.value)">
            <option value="1" ${c.status_id == 1 ? 'selected' : ''}>Submitted</option>
            <option value="2" ${c.status_id == 2 ? 'selected' : ''}>Under Review</option>
            <option value="3" ${c.status_id == 3 ? 'selected' : ''}>Work in Progress</option>
            <option value="4" ${c.status_id == 4 ? 'selected' : ''}>Resolved</option>
          </select>
        </td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">
          ${dateFormatted}
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-sm btn-outline" onclick="openDetailsModal('${c.tracking_id}')" title="Inspect Full Report">
              <i class="fas fa-eye"></i> View
            </button>
            <a href="track.html?id=${c.tracking_id}" class="btn btn-sm btn-secondary" title="Track Progress">
              <i class="fas fa-route"></i>
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 4. Update Status Directly via REST API
async function updateStatusInline(complaintId, newStatusId) {
  const token = localStorage.getItem('smart_civic_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        statusId: parseInt(newStatusId, 10),
        adminNotes: `Status escalated to '${getStatusLabel(newStatusId)}' by Municipal Control Desk.`
      })
    });

    const json = await res.json();
    if (json.success) {
      showToast(`Complaint #${complaintId} status updated to ${getStatusLabel(newStatusId)}!`, 'success');
      // Refresh KPIs and charts dynamically
      fetchStats();
      loadComplaintsTable();
    } else {
      showToast(json.message || 'Failed to update status.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to connect to server for status update.', 'error');
  }
}

function getStatusLabel(id) {
  switch (parseInt(id, 10)) {
    case 1: return 'Submitted';
    case 2: return 'Under Review';
    case 3: return 'Work in Progress';
    case 4: return 'Resolved';
    default: return 'Submitted';
  }
}

// 5. Leaflet Interactive GIS Admin Map
function initAdminMap() {
  const mapEl = document.getElementById('admin-map');
  if (!mapEl) return;

  adminMap = L.map('admin-map').setView([13.0250, 80.0500], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors | Smart Civic GIS'
  }).addTo(adminMap);

  markersLayer = L.layerGroup().addTo(adminMap);
}

function updateMapMarkers(complaints) {
  if (!adminMap || !markersLayer) return;

  markersLayer.clearLayers();

  complaints.forEach(c => {
    const lat = parseFloat(c.latitude);
    const lng = parseFloat(c.longitude);

    if (isNaN(lat) || isNaN(lng)) return;

    // Pin icon color according to severity
    let markerColor = '#3b82f6';
    if (c.severity === 'High') markerColor = '#ef4444';
    else if (c.severity === 'Medium') markerColor = '#f59e0b';
    else if (c.status_name === 'Resolved') markerColor = '#10b981';

    const circleMarker = L.circleMarker([lat, lng], {
      radius: 9,
      fillColor: markerColor,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85
    });

    circleMarker.bindPopup(`
      <div style="min-width: 200px;">
        <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">${c.tracking_id}</div>
        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">${c.title}</div>
        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 6px;"><i class="fas fa-map-marker-alt"></i> ${c.address}</div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge badge-${(c.status_name||'submitted').toLowerCase().replace(/\s+/g,'_')}">${c.status_name}</span>
          <a href="track.html?id=${c.tracking_id}" style="font-size: 0.8rem; font-weight: 600;">Track &rarr;</a>
        </div>
      </div>
    `);

    markersLayer.addLayer(circleMarker);
  });
}

// 6. Modal Details Viewer
function openDetailsModal(trackingId) {
  const complaint = currentComplaintsList.find(c => c.tracking_id === trackingId);
  if (!complaint) return;

  const modal = document.getElementById('details-modal');
  const body = document.getElementById('details-modal-body');

  if (modal && body) {
    body.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
        <div>
          <img src="${complaint.image_url}" alt="Civic Issue" style="width: 100%; height: 220px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--border);" onerror="this.src='/uploads/samples/pothole1.jpg'">
          
          <div style="margin-top: 1rem; background: #f8fafc; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.85rem;">
            <div><strong>AI Model Classification:</strong> ${complaint.ai_detected_category || complaint.category_name}</div>
            <div><strong>Confidence Score:</strong> ${complaint.ai_confidence || 96.4}%</div>
            <div><strong>Reported By:</strong> ${complaint.citizen_name || 'Concerned Citizen'} (${complaint.citizen_email || 'N/A'})</div>
          </div>
        </div>

        <div>
          <div style="font-size: 0.8rem; color: var(--primary); font-weight: 700;">TRACKING ID: ${complaint.tracking_id}</div>
          <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 0.5rem;">${complaint.title}</h3>
          
          <div style="display: flex; gap: 6px; margin-bottom: 1rem;">
            <span class="badge badge-${(complaint.status_name||'submitted').toLowerCase().replace(/\s+/g,'_')}">${complaint.status_name}</span>
            <span class="badge badge-${(complaint.severity||'Medium').toLowerCase()}">${complaint.severity}</span>
          </div>

          <div style="margin-bottom: 1rem; font-size: 0.88rem;">
            <strong>Description:</strong>
            <p style="color: var(--text-muted); margin-top: 2px;">${complaint.description}</p>
          </div>

          <div style="margin-bottom: 1rem; font-size: 0.85rem;">
            <div><strong>Address:</strong> ${complaint.address}</div>
            <div><strong>Landmark:</strong> ${complaint.landmark || 'Near RIT College'}</div>
            <div><strong>Ward:</strong> ${complaint.ward || 'Ward 14'}</div>
            <div><strong>Coordinates:</strong> ${complaint.latitude}, ${complaint.longitude}</div>
          </div>

          <div class="form-group" style="margin-top: 1rem;">
            <label class="form-label" style="font-size: 0.82rem;">Update Official Municipal Remarks:</label>
            <textarea id="modal-admin-notes" class="form-control" style="min-height: 60px; font-size: 0.85rem;">${complaint.admin_notes || ''}</textarea>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-primary" onclick="saveAdminRemarks(${complaint.id || `'${complaint.tracking_id}'`})">
              <i class="fas fa-save"></i> Save Remarks
            </button>
            <a href="track.html?id=${complaint.tracking_id}" class="btn btn-sm btn-outline">
              <i class="fas fa-external-link-alt"></i> Full Tracker
            </a>
          </div>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }
}

async function saveAdminRemarks(id) {
  const notes = document.getElementById('modal-admin-notes').value.trim();
  const token = localStorage.getItem('smart_civic_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        statusId: 2, // In Review
        adminNotes: notes
      })
    });
    const json = await res.json();
    if (json.success) {
      showToast('Municipal remarks saved successfully!', 'success');
      closeModal('details-modal');
      loadComplaintsTable();
    }
  } catch (e) {
    showToast('Failed to save remarks.', 'error');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}
