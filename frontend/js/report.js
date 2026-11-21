/**
 * Smart Civic Issue Reporting & AI Detection Engine
 * Team: DYNAMIC TRIO | Rajalakshmi Institute of Technology
 */

let selectedFile = null;
let selectedSampleUrl = null;
let currentAiPrediction = null;
let pickerMap = null;
let pickerMarker = null;

// Default Coordinates: Rajalakshmi Institute of Technology (RIT Chennai / Poonamallee)
const DEFAULT_LAT = 13.0118;
const DEFAULT_LNG = 80.0039;

document.addEventListener('DOMContentLoaded', () => {
  initLocationMap();
  setupDropzone();
});

// 1. Initialize Interactive Leaflet Location Picker
function initLocationMap() {
  const mapElement = document.getElementById('picker-map');
  if (!mapElement) return;

  pickerMap = L.map('picker-map').setView([DEFAULT_LAT, DEFAULT_LNG], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors | Smart Civic'
  }).addTo(pickerMap);

  // Custom Leaflet Pin Icon
  const pinIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });

  pickerMarker = L.marker([DEFAULT_LAT, DEFAULT_LNG], {
    draggable: true,
    icon: pinIcon
  }).addTo(pickerMap);

  pickerMarker.bindPopup('<b>Issue Incident Location</b><br>Drag marker or click anywhere to adjust location.').openPopup();

  // Update input fields on drag end
  pickerMarker.on('dragend', function (e) {
    const pos = e.target.getLatLng();
    updateLocationInputs(pos.lat, pos.lng);
  });

  // Map Click Listener
  pickerMap.on('click', function (e) {
    pickerMarker.setLatLng(e.latlng);
    updateLocationInputs(e.latlng.lat, e.latlng.lng);
    pickerMarker.openPopup();
  });

  // Initial population of coordinates
  updateLocationInputs(DEFAULT_LAT, DEFAULT_LNG);
}

function updateLocationInputs(lat, lng) {
  const latInput = document.getElementById('report-lat');
  const lngInput = document.getElementById('report-lng');
  if (latInput) latInput.value = parseFloat(lat).toFixed(6);
  if (lngInput) lngInput.value = parseFloat(lng).toFixed(6);
}

// 2. Capture GPS Location using HTML5 Geolocation API
function captureGpsLocation() {
  const btn = document.getElementById('btn-gps-detect');
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'warning');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tagging GPS...';
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      if (pickerMap && pickerMarker) {
        pickerMap.setView([lat, lng], 16);
        pickerMarker.setLatLng([lat, lng]);
      }
      updateLocationInputs(lat, lng);

      const addressInput = document.getElementById('report-address');
      if (addressInput && !addressInput.value) {
        addressInput.value = `GPS Captured Location (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E), Poonamallee Ward 14`;
      }

      showToast('Precise GPS Coordinates Tagged Successfully!', 'success');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-map-marker-alt"></i> GPS Location Tagged';
      }
    },
    (err) => {
      console.warn('Geolocation Error:', err.message);
      showToast('GPS permission denied or timeout. Defaulted to RIT vicinity coordinates.', 'info');
      updateLocationInputs(DEFAULT_LAT, DEFAULT_LNG);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-crosshairs"></i> Detect GPS Location';
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

// 3. Setup File Upload & Drag-and-Drop
function setupDropzone() {
  const dropzone = document.getElementById('image-dropzone');
  const fileInput = document.getElementById('report-image-input');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') {
      fileInput.click();
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedImage(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedImage(e.target.files[0]);
    }
  });
}

function handleSelectedImage(file) {
  selectedFile = file;
  selectedSampleUrl = null;

  // Uncheck sample buttons
  document.querySelectorAll('.sample-btn').forEach(btn => btn.classList.remove('active'));

  // Show Preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const previewImg = document.getElementById('image-preview');
    const previewContainer = document.getElementById('preview-container');
    const dropzoneContent = document.getElementById('dropzone-content');

    if (previewImg && previewContainer) {
      previewImg.src = e.target.result;
      previewContainer.style.display = 'block';
      if (dropzoneContent) dropzoneContent.style.display = 'none';
    }

    // Trigger AI Detection on selected image
    triggerAiDetection(file, null);
  };
  reader.readAsDataURL(file);
}

// 4. Quick Sample Images Selector for Evaluators
function selectSampleImage(type, btnElement) {
  document.querySelectorAll('.sample-btn').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  const sampleMap = {
    pothole: {
      url: '/uploads/samples/pothole1.jpg',
      name: 'pothole_sample1.jpg',
      title: 'Severe Pothole on Highway'
    },
    garbage: {
      url: '/uploads/samples/garbage1.jpg',
      name: 'garbage_sample1.jpg',
      title: 'Overflowing Municipal Garbage Dump'
    },
    damaged_road: {
      url: '/uploads/samples/damaged_road1.jpg',
      name: 'damaged_road_sample1.jpg',
      title: 'Eroded Asphalt & Broken Road Surface'
    },
    streetlight: {
      url: '/uploads/samples/streetlight1.jpg',
      name: 'streetlight_sample1.jpg',
      title: 'Defective Streetlight Pole'
    }
  };

  const sample = sampleMap[type];
  if (!sample) return;

  selectedFile = null;
  selectedSampleUrl = sample.url;

  const previewImg = document.getElementById('image-preview');
  const previewContainer = document.getElementById('preview-container');
  const dropzoneContent = document.getElementById('dropzone-content');

  if (previewImg && previewContainer) {
    previewImg.src = sample.url;
    previewContainer.style.display = 'block';
    if (dropzoneContent) dropzoneContent.style.display = 'none';
  }

  const titleInput = document.getElementById('report-title');
  if (titleInput && !titleInput.value) {
    titleInput.value = sample.title;
  }

  // Trigger AI Detection with sample name
  triggerAiDetection(null, sample.name);
}

function removeSelectedImage(e) {
  if (e) e.stopPropagation();
  selectedFile = null;
  selectedSampleUrl = null;
  currentAiPrediction = null;

  const previewContainer = document.getElementById('preview-container');
  const dropzoneContent = document.getElementById('dropzone-content');
  const aiBox = document.getElementById('ai-result-box');
  const fileInput = document.getElementById('report-image-input');

  if (fileInput) fileInput.value = '';
  if (previewContainer) previewContainer.style.display = 'none';
  if (dropzoneContent) dropzoneContent.style.display = 'block';
  if (aiBox) aiBox.classList.remove('active');
  document.querySelectorAll('.sample-btn').forEach(btn => btn.classList.remove('active'));
}

// 5. AI Issue Detection API Call
async function triggerAiDetection(file, imageName) {
  const aiBox = document.getElementById('ai-result-box');
  if (!aiBox) return;

  aiBox.classList.add('active');
  aiBox.innerHTML = `
    <div style="text-align: center; padding: 1.5rem 0;">
      <i class="fas fa-brain fa-spin" style="font-size: 2.2rem; color: var(--primary); margin-bottom: 0.75rem;"></i>
      <h4 style="font-size: 1.05rem; font-weight: 700;">Running Pre-Trained AI Classifier...</h4>
      <p style="font-size: 0.85rem; color: var(--text-muted);">Analyzing image patterns, cavity depth, and urban infrastructure features</p>
    </div>
  `;

  try {
    let res;
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      res = await fetch(`${API_BASE}/detect`, {
        method: 'POST',
        body: formData
      });
    } else {
      res = await fetch(`${API_BASE}/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageName: imageName })
      });
    }

    const json = await res.json();

    if (json.success) {
      currentAiPrediction = json.data;
      displayAiResult(json.data);
    } else {
      aiBox.innerHTML = `<p style="color:var(--danger);">AI Detection failed: ${json.message}</p>`;
    }
  } catch (err) {
    console.error(err);
    aiBox.innerHTML = `<p style="color:var(--danger);">Error connecting to AI Detection service.</p>`;
  }
}

function displayAiResult(data) {
  const aiBox = document.getElementById('ai-result-box');
  if (!aiBox) return;

  // Auto-sync form selects
  const categorySelect = document.getElementById('report-category');
  const severitySelect = document.getElementById('report-severity');

  if (categorySelect) categorySelect.value = data.category_id;
  if (severitySelect) severitySelect.value = data.severity;

  aiBox.innerHTML = `
    <div class="ai-header">
      <span class="ai-tag"><i class="fas fa-microchip"></i> AI DETECTED ISSUE</span>
      <span class="ai-confidence-badge"><i class="fas fa-check-circle"></i> ${data.confidence}% Confidence</span>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
      <h3 class="ai-prediction-title">${data.category}</h3>
      <span class="badge badge-${data.severity.toLowerCase()}">Suggested Priority: ${data.severity}</span>
    </div>

    <ul class="ai-indicators-list">
      ${data.indicators.map(ind => `<li><i class="fas fa-arrow-right" style="color: var(--primary); font-size: 0.75rem;"></i> ${ind}</li>`).join('')}
    </ul>

    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 0.75rem; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap; gap: 6px;">
      <div><i class="fas fa-stopwatch"></i> Estimated SLA: <b>${data.repair_eta}</b></div>
      <a href="javascript:void(0)" onclick="toggleCorrectionSection()" class="ai-correction-toggle">
        <i class="fas fa-pencil-alt"></i> Incorrect prediction? Click to manually adjust
      </a>
    </div>

    <div id="ai-correction-wrapper" style="display:none; margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed #cbd5e1;">
      <p style="font-size: 0.82rem; font-weight: 600; color: #1e3a8a; margin-bottom: 0.5rem;">
        You can override the AI prediction below before submitting. Your correction helps continuously retrain our model!
      </p>
    </div>
  `;
}

function toggleCorrectionSection() {
  const wrapper = document.getElementById('ai-correction-wrapper');
  if (wrapper) {
    wrapper.style.display = wrapper.style.display === 'none' ? 'block' : 'none';
    const catGroup = document.getElementById('category-group');
    if (catGroup) {
      catGroup.scrollIntoView({ behavior: 'smooth' });
      catGroup.style.background = '#fef3c7';
      setTimeout(() => catGroup.style.background = 'transparent', 1500);
    }
  }
}

// 6. Submit Complaint Form
async function handleComplaintSubmit(e) {
  e.preventDefault();

  if (!selectedFile && !selectedSampleUrl) {
    showToast('Please upload an issue photograph or select a sample image.', 'error');
    return;
  }

  const title = document.getElementById('report-title').value.trim();
  const description = document.getElementById('report-desc').value.trim();
  const categoryId = document.getElementById('report-category').value;
  const severity = document.getElementById('report-severity').value;
  const address = document.getElementById('report-address').value.trim();
  const landmark = document.getElementById('report-landmark').value.trim();
  const ward = document.getElementById('report-ward').value.trim();
  const lat = document.getElementById('report-lat').value;
  const lng = document.getElementById('report-lng').value;
  const citizenName = document.getElementById('report-name') ? document.getElementById('report-name').value.trim() : '';
  const citizenEmail = document.getElementById('report-email') ? document.getElementById('report-email').value.trim() : '';

  if (!title || !description) {
    showToast('Please provide both an issue title and description.', 'error');
    return;
  }

  const submitBtn = document.getElementById('btn-submit-complaint');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Complaint to Municipal Database...';

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('categoryId', categoryId);
  formData.append('severity', severity);
  formData.append('address', address || 'Chennai Highway Road, Poonamallee');
  formData.append('landmark', landmark || 'Near Rajalakshmi Institute of Technology');
  formData.append('ward', ward || 'Ward 14');
  formData.append('latitude', lat || DEFAULT_LAT);
  formData.append('longitude', lng || DEFAULT_LNG);
  formData.append('citizenName', citizenName);
  formData.append('citizenEmail', citizenEmail);

  if (currentAiPrediction) {
    formData.append('aiDetectedCategory', currentAiPrediction.category);
    formData.append('aiConfidence', currentAiPrediction.confidence);
    const isCorrected = String(currentAiPrediction.category_id) !== String(categoryId);
    formData.append('isAiCorrected', isCorrected);
  }

  if (selectedFile) {
    formData.append('image', selectedFile);
  } else if (selectedSampleUrl) {
    formData.append('sampleImageUrl', selectedSampleUrl);
  }

  const token = localStorage.getItem('smart_civic_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    const json = await res.json();

    if (json.success) {
      showSuccessModal(json.tracking_id, json.complaint);
    } else {
      showToast(json.message || 'Failed to submit complaint.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Complaint';
    }
  } catch (err) {
    console.error(err);
    showToast('Server communication error.', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Complaint';
  }
}

function showSuccessModal(trackingId, complaint) {
  const modal = document.getElementById('success-modal');
  const modalContent = document.getElementById('success-modal-body');

  if (modal && modalContent) {
    modalContent.innerHTML = `
      <div style="text-align: center; padding: 1rem 0;">
        <div style="width: 64px; height: 64px; background: #d1fae5; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; font-size: 2rem;">
          <i class="fas fa-check"></i>
        </div>
        <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-main);">Complaint Lodged Successfully!</h3>
        <p style="color: var(--text-muted); font-size: 0.92rem; margin-bottom: 1.5rem;">
          Your issue has been verified and registered in the municipal database. You can track resolution progress at any time.
        </p>

        <div style="background: #f1f5f9; padding: 1rem; border-radius: var(--radius-md); border: 1px dashed #cbd5e1; margin-bottom: 1.5rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Unique Tracking ID</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary); letter-spacing: 0.05em;">${trackingId}</div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center;">
          <a href="track.html?id=${trackingId}" class="btn btn-primary">
            <i class="fas fa-search-location"></i> Track This Issue Now
          </a>
          <a href="report.html" class="btn btn-outline" onclick="location.reload()">
            <i class="fas fa-plus"></i> Report Another
          </a>
        </div>
      </div>
    `;
    modal.classList.add('active');
  }
}
