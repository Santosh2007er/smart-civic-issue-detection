const { getPool, isMySQLConnected, inMemoryStore } = require('../config/db');

class ComplaintModel {
  static async create(data) {
    const trackingId = 'CIVIC-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    if (isMySQLConnected()) {
      const pool = getPool();
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        const [cRes] = await conn.query(
          `INSERT INTO complaints (
            tracking_id, user_id, category_id, custom_category, title, description,
            image_url, severity, status_id, ai_detected_category, ai_confidence,
            is_ai_corrected, admin_notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            trackingId,
            data.userId || null,
            data.categoryId || 1,
            data.categoryName || 'General Civic Issue',
            data.title,
            data.description,
            data.imageUrl,
            data.severity || 'Medium',
            1, // Submitted
            data.aiDetectedCategory || null,
            data.aiConfidence || null,
            data.isAiCorrected ? 1 : 0,
            data.adminNotes || null
          ]
        );

        const complaintId = cRes.insertId;

        await conn.query(
          `INSERT INTO locations (
            complaint_id, latitude, longitude, address, landmark, ward, city, postal_code
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            complaintId,
            data.latitude || 13.0118,
            data.longitude || 80.0039,
            data.address || 'Chennai Highway Road, Poonamallee',
            data.landmark || 'Near Rajalakshmi Institute of Technology',
            data.ward || 'Ward 14',
            data.city || 'Chennai',
            data.postalCode || '600124'
          ]
        );

        await conn.commit();
        conn.release();

        return this.getById(complaintId);
      } catch (err) {
        await conn.rollback();
        conn.release();
        throw err;
      }
    } else {
      // In-Memory store insertion
      const newId = inMemoryStore.complaints.length + 1;
      const cat = inMemoryStore.categories.find(c => c.id === parseInt(data.categoryId, 10)) || inMemoryStore.categories[0];
      const stat = inMemoryStore.statuses[0]; // Submitted

      const newComplaint = {
        id: newId,
        tracking_id: trackingId,
        user_id: data.userId || null,
        citizen_name: data.citizenName || 'Concerned Citizen',
        citizen_email: data.citizenEmail || 'citizen@ritchennai.edu.in',
        category_id: cat.id,
        category_name: cat.name,
        category_code: cat.code,
        title: data.title,
        description: data.description,
        image_url: data.imageUrl,
        severity: data.severity || 'Medium',
        status_id: stat.id,
        status_name: stat.name,
        status_code: stat.code,
        status_color: stat.color,
        ai_detected_category: data.aiDetectedCategory || cat.name,
        ai_confidence: data.aiConfidence || 95.0,
        is_ai_corrected: data.isAiCorrected ? 1 : 0,
        admin_notes: data.adminNotes || 'New complaint logged via Smart Civic Portal.',
        latitude: parseFloat(data.latitude) || 13.0118,
        longitude: parseFloat(data.longitude) || 80.0039,
        address: data.address || 'Chennai Highway Road, Poonamallee',
        landmark: data.landmark || 'Near Rajalakshmi Institute of Technology',
        ward: data.ward || 'Ward 14',
        city: data.city || 'Chennai',
        postal_code: data.postalCode || '600124',
        created_at: new Date().toISOString()
      };

      inMemoryStore.complaints.unshift(newComplaint);
      return newComplaint;
    }
  }

  static async getAll(filters = {}) {
    if (isMySQLConnected()) {
      const pool = getPool();
      let query = `
        SELECT
          c.id, c.tracking_id, c.user_id, c.title, c.description, c.image_url,
          c.severity, c.ai_detected_category, c.ai_confidence, c.is_ai_corrected,
          c.admin_notes, c.created_at, c.updated_at, c.resolved_at,
          cat.id AS category_id, cat.name AS category_name, cat.code AS category_code, cat.icon AS category_icon,
          st.id AS status_id, st.name AS status_name, st.code AS status_code, st.color AS status_color, st.step_order,
          loc.latitude, loc.longitude, loc.address, loc.landmark, loc.ward, loc.city, loc.postal_code,
          u.full_name AS citizen_name, u.email AS citizen_email
        FROM complaints c
        LEFT JOIN issue_categories cat ON c.category_id = cat.id
        LEFT JOIN complaint_statuses st ON c.status_id = st.id
        LEFT JOIN locations loc ON c.id = loc.complaint_id
        LEFT JOIN users u ON c.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.search) {
        query += ` AND (c.tracking_id LIKE ? OR c.title LIKE ? OR loc.address LIKE ? OR c.description LIKE ?)`;
        const s = `%${filters.search}%`;
        params.push(s, s, s, s);
      }
      if (filters.category) {
        query += ` AND (cat.code = ? OR cat.id = ?)`;
        params.push(filters.category, filters.category);
      }
      if (filters.status) {
        query += ` AND (st.code = ? OR st.id = ?)`;
        params.push(filters.status, filters.status);
      }
      if (filters.severity) {
        query += ` AND c.severity = ?`;
        params.push(filters.severity);
      }
      if (filters.userId) {
        query += ` AND c.user_id = ?`;
        params.push(filters.userId);
      }

      query += ` ORDER BY c.created_at DESC`;
      const [rows] = await pool.query(query, params);
      return rows;
    } else {
      let results = [...inMemoryStore.complaints];

      if (filters.search) {
        const s = filters.search.toLowerCase();
        results = results.filter(c =>
          c.tracking_id.toLowerCase().includes(s) ||
          c.title.toLowerCase().includes(s) ||
          c.address.toLowerCase().includes(s) ||
          c.description.toLowerCase().includes(s)
        );
      }
      if (filters.category) {
        results = results.filter(c =>
          c.category_code === filters.category ||
          String(c.category_id) === String(filters.category)
        );
      }
      if (filters.status) {
        results = results.filter(c =>
          c.status_code === filters.status ||
          String(c.status_id) === String(filters.status)
        );
      }
      if (filters.severity) {
        results = results.filter(c => c.severity.toLowerCase() === filters.severity.toLowerCase());
      }
      if (filters.userId) {
        results = results.filter(c => String(c.user_id) === String(filters.userId));
      }

      return results;
    }
  }

  static async getById(idOrTrackingId) {
    if (isMySQLConnected()) {
      const pool = getPool();
      const query = `
        SELECT
          c.id, c.tracking_id, c.user_id, c.title, c.description, c.image_url,
          c.severity, c.ai_detected_category, c.ai_confidence, c.is_ai_corrected,
          c.admin_notes, c.created_at, c.updated_at, c.resolved_at,
          cat.id AS category_id, cat.name AS category_name, cat.code AS category_code, cat.icon AS category_icon,
          st.id AS status_id, st.name AS status_name, st.code AS status_code, st.color AS status_color, st.step_order,
          loc.latitude, loc.longitude, loc.address, loc.landmark, loc.ward, loc.city, loc.postal_code,
          u.full_name AS citizen_name, u.email AS citizen_email, u.phone AS citizen_phone
        FROM complaints c
        LEFT JOIN issue_categories cat ON c.category_id = cat.id
        LEFT JOIN complaint_statuses st ON c.status_id = st.id
        LEFT JOIN locations loc ON c.id = loc.complaint_id
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = ? OR c.tracking_id = ?
        LIMIT 1
      `;
      const [rows] = await pool.query(query, [idOrTrackingId, idOrTrackingId]);
      return rows[0] || null;
    } else {
      const item = inMemoryStore.complaints.find(
        c => String(c.id) === String(idOrTrackingId) || c.tracking_id.toUpperCase() === String(idOrTrackingId).toUpperCase()
      );
      return item || null;
    }
  }

  static async updateStatus(id, { statusId, adminNotes, resolvedAt = null }) {
    if (isMySQLConnected()) {
      const pool = getPool();
      let query = `UPDATE complaints SET status_id = ?`;
      const params = [statusId];

      if (adminNotes !== undefined) {
        query += `, admin_notes = ?`;
        params.push(adminNotes);
      }
      if (statusId == 4) { // 4 is Resolved
        query += `, resolved_at = NOW()`;
      } else if (resolvedAt) {
        query += `, resolved_at = ?`;
        params.push(resolvedAt);
      }

      query += ` WHERE id = ? OR tracking_id = ?`;
      params.push(id, id);

      await pool.query(query, params);
      return this.getById(id);
    } else {
      const item = inMemoryStore.complaints.find(
        c => String(c.id) === String(id) || c.tracking_id.toUpperCase() === String(id).toUpperCase()
      );
      if (!item) return null;

      const newStat = inMemoryStore.statuses.find(s => s.id === parseInt(statusId, 10)) || inMemoryStore.statuses[0];
      item.status_id = newStat.id;
      item.status_name = newStat.name;
      item.status_code = newStat.code;
      item.status_color = newStat.color;

      if (adminNotes !== undefined) {
        item.admin_notes = adminNotes;
      }
      if (newStat.id === 4) {
        item.resolved_at = new Date().toISOString();
      }

      return item;
    }
  }

  static async getStats() {
    const complaints = await this.getAll();

    const total = complaints.length;
    const pending = complaints.filter(c => c.status_name !== 'Resolved').length;
    const resolved = complaints.filter(c => c.status_name === 'Resolved').length;
    const highPriority = complaints.filter(c => c.severity === 'High').length;

    // Category breakdown
    const categoryCounts = {
      Potholes: 0,
      'Garbage Accumulation': 0,
      'Damaged Roads': 0,
      'Broken Streetlights': 0
    };
    complaints.forEach(c => {
      const name = c.category_name || 'Other';
      categoryCounts[name] = (categoryCounts[name] || 0) + 1;
    });

    // Status breakdown
    const statusCounts = {
      Submitted: 0,
      'Under Review': 0,
      'Work in Progress': 0,
      Resolved: 0
    };
    complaints.forEach(c => {
      const s = c.status_name || 'Submitted';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    // Severity breakdown
    const severityCounts = {
      High: 0,
      Medium: 0,
      Low: 0
    };
    complaints.forEach(c => {
      const sev = c.severity || 'Medium';
      severityCounts[sev] = (severityCounts[sev] || 0) + 1;
    });

    return {
      total,
      pending,
      resolved,
      highPriority,
      categories: categoryCounts,
      statuses: statusCounts,
      severities: severityCounts
    };
  }
}

module.exports = ComplaintModel;
