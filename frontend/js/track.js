/**
 * Complaint Progress Tracking Module
 * Team: DYNAMIC TRIO | Rajalakshmi Institute of Technology
 */

let trackMap = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check if query string contains 'id' (e.g. track.html?id=CIVIC-2026-1001)
  const urlParams = new URLSearchParams(window.location.search);
  const complaintId = urlParams.get('id');
  if (complaintId) {
    const input = document.getElementById('track-search-input');
    if (input) input.value = complaintId;
    searchComplaint(complaintId);
  }
});

async function handleTrackSearch(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('track-search-input');
  if (!input || !input.value.trim()) {
    showToast('Please enter a Complaint Tracking ID.', 'warning');
    return;
  }
  searchComplaint(input.value.trim());
}

async function searchComplaint(trackingId) {
  const resultContainer = document.getElementById('track-result-container');
  const searchBtn = document.getElementById('btn-track-submit');

  if (!resultContainer) return;

  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tracking...';
  }

  resultContainer.innerHTML = `
    <div style="text-align: center; padding: 3rem 0;">
      <i class="fas fa-satellite-dish fa-spin" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem;"></i>
      <p style="color: var(--text-muted);">Querying municipal civic issue registry...</p>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(trackingId)}`);
    const json = await res.json();

    if (json.success && json.data) {
      renderComplaintTracking(json.data);
    } else {
      resultContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: 2.5rem;">
          <div style="font-size: 2.5rem; color: var(--danger); margin-bottom: 0.75rem;">
            <i class="fas fa-search-minus"></i>
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Complaint Not Found</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 480px; margin: 0 auto 1.5rem;">
            No record matches tracking reference <b>"${trackingId}"</b>. Please check your tracking number or lodge a new issue.
          </p>
          <a href="report.html" class="btn btn-primary"><i class="fas fa-plus"></i> Report a New Civic Issue</a>
        </div>
      `;
    }
  } catch (err) {
    console.error(err);
    resultContainer.innerHTML = `<p style="color:var(--danger); text-align:center;">Network error communicating with tracking server.</p>`;
  } finally {
    if (searchBtn) {
      searchBtn.disabled = false;
      searchBtn.innerHTML = '<i class="fas fa-search"></i> Track Status';
    }
  }
}

function renderComplaintTracking(c) {
  const container = document.getElementById('track-result-container');
  if (!container) return;

  // Determine active step (1 to 4)
  const stepOrder = c.step_order || (c.status_id ? parseInt(c.status_id, 10) : 1);
  const progressWidth = ((stepOrder - 1) / 3) * 100;

  const steps = [
    { title: 'Submitted', desc: 'Logged with AI Analysis' },
    { title: 'Under Review', desc: 'Ward Inspection Assigned' },
    { title: 'Work in Progress', desc: 'Crew & Materials Dispatched' },
    { title: 'Resolved', desc: 'Completed & Certified' }
  ];

  const formattedDate = new Date(c.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const statusCode = (c.status_code || c.status_name || 'submitted').toLowerCase().replace(/\s+/g, '_');
  const severityCode = (c.severity || 'Medium').toLowerCase();

  container.innerHTML = `
    <!-- Tracking Card Header -->
    <div class="card" style="margin-bottom: 1.5rem; border-left: 5px solid ${c.status_color || 'var(--primary)'};">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <span class="badge badge-${statusCode}" style="font-size: 0.85rem; margin-bottom: 6px;">
            <span class="badge-dot"></span> Current Status: ${c.status_name}
          </span>
          <h2 style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); line-height: 1.3;">${c.title}</h2>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
            <i class="far fa-clock"></i> Reported on: <b>${formattedDate}</b> | Tracking Ref: <b>${c.tracking_id}</b>
          </div>
        </div>
        <div style="text-align: right;">
          <span class="badge badge-${severityCode}" style="font-size: 0.85rem;">
            <i class="fas fa-exclamation-triangle"></i> Priority: ${c.severity}
          </span>
        </div>
      </div>

      <!-- 4-Stage Progress Stepper -->
      <div class="stepper-container">
        <div class="stepper-progress-line" style="width: ${progressWidth}%;"></div>
        ${steps.map((st, idx) => {
          const stepNum = idx + 1;
          let stepClass = '';
          if (stepNum < stepOrder) stepClass = 'completed';
          else if (stepNum === stepOrder) stepClass = 'active';

          return `
            <div class="step-item ${stepClass}">
              <div class="step-circle">
                ${stepNum < stepOrder ? '<i class="fas fa-check"></i>' : stepNum}
              </div>
              <div class="step-label">${st.title}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${st.desc}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Details Split Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <!-- Issue Photograph & AI Metadata -->
      <div class="card">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">
          <i class="fas fa-camera" style="color: var(--primary);"></i> Issue Photograph & AI Classification
        </h3>
        <div style="border-radius: var(--radius-md); overflow: hidden; margin-bottom: 1rem; border: 1px solid var(--border);">
          <img src="${c.image_url}" alt="Civic Issue" style="width: 100%; height: 220px; object-fit: cover;" onerror="this.src='/uploads/samples/pothole1.jpg'">
        </div>

        <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.85rem 1rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
            <span style="color: var(--text-muted);">Detected Category:</span>
            <span style="font-weight: 700; color: var(--text-main);">${c.category_name || c.ai_detected_category}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
            <span style="color: var(--text-muted);">AI Confidence Score:</span>
            <span style="font-weight: 700; color: var(--success);">${c.ai_confidence ? c.ai_confidence + '%' : '96.4%'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
            <span style="color: var(--text-muted);">Citizen Correction:</span>
            <span style="font-weight: 600;">${c.is_ai_corrected ? 'Yes (Manually Adjusted)' : 'No (AI Prediction Confirmed)'}</span>
          </div>
        </div>

        <div style="margin-top: 1rem;">
          <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">CITIZEN'S DESCRIPTION</h4>
          <p style="font-size: 0.9rem; color: var(--text-main);">${c.description}</p>
        </div>
      </div>

      <!-- Incident Location & Municipal Action Log -->
      <div class="card">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">
          <i class="fas fa-map-marked-alt" style="color: var(--primary);"></i> Geo-Location & Incident Spot
        </h3>
        
        <div id="track-map" style="width: 100%; height: 220px; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--border);"></div>

        <div style="font-size: 0.88rem; margin-bottom: 1rem;">
          <div style="margin-bottom: 4px;"><strong>Street Address:</strong> ${c.address || 'Chennai Highway Road, Poonamallee'}</div>
          <div style="margin-bottom: 4px;"><strong>Landmark:</strong> ${c.landmark || 'Near Rajalakshmi Institute of Technology'}</div>
          <div style="margin-bottom: 4px;"><strong>Ward / Zone:</strong> ${c.ward || 'Ward 14'} | <strong>Coordinates:</strong> ${parseFloat(c.latitude).toFixed(4)}° N, ${parseFloat(c.longitude).toFixed(4)}° E</div>
        </div>

        <!-- Municipal Remarks Box -->
        <div style="background: #eff6ff; border-left: 4px solid var(--primary); padding: 0.85rem 1rem; border-radius: var(--radius-sm);">
          <div style="font-weight: 700; font-size: 0.85rem; color: var(--primary); margin-bottom: 3px;">
            <i class="fas fa-user-shield"></i> Municipal Officer Remarks:
          </div>
          <div style="font-size: 0.88rem; color: #1e3a8a;">
            ${c.admin_notes || 'Complaint received and scheduled for zonal maintenance action.'}
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize Map for tracking location
  setTimeout(() => {
    const lat = parseFloat(c.latitude) || 13.0118;
    const lng = parseFloat(c.longitude) || 80.0039;

    if (trackMap) {
      trackMap.remove();
    }

    trackMap = L.map('track-map').setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(trackMap);

    L.marker([lat, lng])
      .addTo(trackMap)
      .bindPopup(`<b>${c.title}</b><br>${c.category_name}`)
      .openPopup();
  }, 100);
}
