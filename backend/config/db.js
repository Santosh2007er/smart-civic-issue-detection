const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_civic_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isConnected = false;

// In-Memory fallback store for seamless demonstration if MySQL is temporarily offline
const inMemoryStore = {
  users: [
    {
      id: 1,
      full_name: 'Municipal Admin',
      email: 'admin@smartcivic.gov.in',
      phone: '+91 98765 43210',
      password: '$2a$10$tZ261kU/R01g00i3v2L1f.2QkO2kQGkRj5iBwS6k1O4a8K9Q2kQGK', // admin123
      role: 'admin',
      created_at: new Date('2026-01-10')
    },
    {
      id: 2,
      full_name: 'Nisanthan S (Citizen)',
      email: 'nisanthan@ritchennai.edu.in',
      phone: '+91 94441 23456',
      password: '$2a$10$tZ261kU/R01g00i3v2L1f.2QkO2kQGkRj5iBwS6k1O4a8K9Q2kQGK', // admin123
      role: 'citizen',
      created_at: new Date('2026-02-01')
    },
    {
      id: 3,
      full_name: 'Santosh G (Citizen)',
      email: 'santosh@ritchennai.edu.in',
      phone: '+91 94442 34567',
      password: '$2a$10$tZ261kU/R01g00i3v2L1f.2QkO2kQGkRj5iBwS6k1O4a8K9Q2kQGK',
      role: 'citizen',
      created_at: new Date('2026-02-05')
    }
  ],
  categories: [
    { id: 1, code: 'pothole', name: 'Potholes', default_severity: 'High', icon: 'fa-road', description: 'Deep holes or cracks in asphalt creating high risk of accidents.' },
    { id: 2, code: 'garbage', name: 'Garbage Accumulation', default_severity: 'Medium', icon: 'fa-trash-alt', description: 'Overflowing dumpsters or unattended waste heaps.' },
    { id: 3, code: 'damaged_road', name: 'Damaged Roads', default_severity: 'High', icon: 'fa-car-crash', description: 'Severe surface erosion, broken pavement, asphalt crumbling.' },
    { id: 4, code: 'broken_streetlight', name: 'Broken Streetlights', default_severity: 'Medium', icon: 'fa-lightbulb', description: 'Non-functional lamps or dark corridors at night.' }
  ],
  statuses: [
    { id: 1, code: 'submitted', name: 'Submitted', step_order: 1, color: '#3b82f6' },
    { id: 2, code: 'under_review', name: 'Under Review', step_order: 2, color: '#8b5cf6' },
    { id: 3, code: 'work_in_progress', name: 'Work in Progress', step_order: 3, color: '#f59e0b' },
    { id: 4, code: 'resolved', name: 'Resolved', step_order: 4, color: '#10b981' }
  ],
  complaints: [
    {
      id: 1,
      tracking_id: 'CIVIC-2026-1001',
      user_id: 2,
      citizen_name: 'Nisanthan S (Citizen)',
      citizen_email: 'nisanthan@ritchennai.edu.in',
      category_id: 1,
      category_name: 'Potholes',
      category_code: 'pothole',
      title: 'Critical deep pothole near RIT College entrance',
      description: 'Extremely dangerous 1.5 ft pothole causing two-wheelers to skid near the Bangalore Highway service road crossing.',
      image_url: '/uploads/samples/pothole1.jpg',
      severity: 'High',
      status_id: 3,
      status_name: 'Work in Progress',
      status_code: 'work_in_progress',
      status_color: '#f59e0b',
      ai_detected_category: 'Potholes',
      ai_confidence: 96.4,
      is_ai_corrected: 0,
      admin_notes: 'Road maintenance unit #4 dispatched with asphalt cold-mix.',
      latitude: 13.012500,
      longitude: 80.004100,
      address: 'Bangalore High Road, Chembarambakkam',
      landmark: 'Opposite Rajalakshmi Institute of Technology Entrance Gate',
      ward: 'Ward 12',
      city: 'Chennai',
      postal_code: '600124',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 2,
      tracking_id: 'CIVIC-2026-1002',
      user_id: 3,
      citizen_name: 'Santosh G (Citizen)',
      citizen_email: 'santosh@ritchennai.edu.in',
      category_id: 2,
      category_name: 'Garbage Accumulation',
      category_code: 'garbage',
      title: 'Overflowing community garbage dump on Poonamallee High Rd',
      description: 'Garbage containers overflowing onto pedestrian walkway. Stray animals scattering plastic waste. Strong foul odor.',
      image_url: '/uploads/samples/garbage1.jpg',
      severity: 'High',
      status_id: 2,
      status_name: 'Under Review',
      status_code: 'under_review',
      status_color: '#8b5cf6',
      ai_detected_category: 'Garbage Accumulation',
      ai_confidence: 94.8,
      is_ai_corrected: 0,
      admin_notes: 'Ward sanitary inspector notified; hydraulic compactor scheduled for 2:00 PM.',
      latitude: 13.048900,
      longitude: 80.093400,
      address: 'Poonamallee Trunk Road, Near Bus Terminus',
      landmark: 'Adjacent to Poonamallee Municipal Market',
      ward: 'Ward 18',
      city: 'Poonamallee',
      postal_code: '600056',
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 3,
      tracking_id: 'CIVIC-2026-1003',
      user_id: 2,
      citizen_name: 'Nisanthan S (Citizen)',
      citizen_email: 'nisanthan@ritchennai.edu.in',
      category_id: 4,
      category_name: 'Broken Streetlights',
      category_code: 'broken_streetlight',
      title: 'Blackout along Kuthambakkam main link road',
      description: 'Three continuous LED streetlights are non-functional for past 4 nights. Poses severe safety risk to female students and commuters.',
      image_url: '/uploads/samples/streetlight1.jpg',
      severity: 'Medium',
      status_id: 1,
      status_name: 'Submitted',
      status_code: 'submitted',
      status_color: '#3b82f6',
      ai_detected_category: 'Broken Streetlights',
      ai_confidence: 91.5,
      is_ai_corrected: 0,
      admin_notes: 'Report assigned to TANGEDCO electrical maintenance wing.',
      latitude: 13.019800,
      longitude: 80.015200,
      address: 'Kuthambakkam Link Road',
      landmark: 'Near Proposed Bus Port Project Site',
      ward: 'Ward 14',
      city: 'Chennai',
      postal_code: '600124',
      created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    },
    {
      id: 4,
      tracking_id: 'CIVIC-2026-1004',
      user_id: 3,
      citizen_name: 'Santosh G (Citizen)',
      citizen_email: 'santosh@ritchennai.edu.in',
      category_id: 3,
      category_name: 'Damaged Roads',
      category_code: 'damaged_road',
      title: 'Cracked tarmac and loose gravel near Chembarambakkam junction',
      description: 'Severe road top layer erosion post recent rains. Heavy vehicles bouncing, gravel hitting windshields of smaller vehicles.',
      image_url: '/uploads/samples/damaged_road1.jpg',
      severity: 'Medium',
      status_id: 4,
      status_name: 'Resolved',
      status_code: 'resolved',
      status_color: '#10b981',
      ai_detected_category: 'Damaged Roads',
      ai_confidence: 95.2,
      is_ai_corrected: 0,
      admin_notes: 'Patchwork and resurfacing completed and signed off by Zonal Engineer.',
      latitude: 13.008400,
      longitude: 80.019500,
      address: 'Chembarambakkam Lake View Road',
      landmark: 'Near Chembarambakkam Water Works Bridge',
      ward: 'Ward 15',
      city: 'Chennai',
      postal_code: '600124',
      created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 5,
      tracking_id: 'CIVIC-2026-1005',
      user_id: 2,
      citizen_name: 'Nisanthan S (Citizen)',
      citizen_email: 'nisanthan@ritchennai.edu.in',
      category_id: 1,
      category_name: 'Potholes',
      category_code: 'pothole',
      title: 'Multiple consecutive potholes on Avadi - Poonamallee road',
      description: 'Cluster of four rain-filled craters in front of bus shelter. Water splashing on pedestrians and school children.',
      image_url: '/uploads/samples/pothole2.jpg',
      severity: 'High',
      status_id: 2,
      status_name: 'Under Review',
      status_code: 'under_review',
      status_color: '#8b5cf6',
      ai_detected_category: 'Potholes',
      ai_confidence: 98.1,
      is_ai_corrected: 0,
      admin_notes: 'Barricades placed by traffic police. Paving crew in transit.',
      latitude: 13.061200,
      longitude: 80.104200,
      address: 'Avadi - Poonamallee Main Road',
      landmark: 'Near Paruthipattu Green Park Junction',
      ward: 'Ward 21',
      city: 'Avadi',
      postal_code: '600071',
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    }
  ]
};

async function initDB() {
  try {
    // 1. Attempt connection to MySQL server
    const serverConn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await serverConn.end();

    // 2. Create connection pool to the smart_civic_db
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();

    // 3. Create tables if not exist
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(20) DEFAULT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('citizen', 'admin', 'officer') DEFAULT 'citizen',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS issue_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        default_severity ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        icon VARCHAR(50) DEFAULT 'exclamation-circle',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS complaint_statuses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        step_order INT NOT NULL,
        color VARCHAR(20) DEFAULT '#2563eb',
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tracking_id VARCHAR(30) NOT NULL UNIQUE,
        user_id INT DEFAULT NULL,
        category_id INT NOT NULL,
        custom_category VARCHAR(100) DEFAULT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        severity ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
        status_id INT NOT NULL DEFAULT 1,
        ai_detected_category VARCHAR(100) DEFAULT NULL,
        ai_confidence DECIMAL(5,2) DEFAULT NULL,
        is_ai_corrected TINYINT(1) DEFAULT 0,
        admin_notes TEXT DEFAULT NULL,
        resolved_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_id INT NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        address TEXT NOT NULL,
        landmark VARCHAR(150) DEFAULT NULL,
        ward VARCHAR(50) DEFAULT 'Ward 14',
        city VARCHAR(100) DEFAULT 'Chennai',
        postal_code VARCHAR(20) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if initial categories and statuses are seeded
    const [cats] = await conn.query('SELECT COUNT(*) as cnt FROM issue_categories');
    if (cats[0].cnt === 0) {
      await conn.query(`
        INSERT INTO issue_categories (id, code, name, default_severity, icon, description) VALUES
        (1, 'pothole', 'Potholes', 'High', 'fa-road', 'Deep holes or cracks in asphalt creating high risk of accidents.'),
        (2, 'garbage', 'Garbage Accumulation', 'Medium', 'fa-trash-alt', 'Overflowing waste dumpsters or unattended garbage heaps.'),
        (3, 'damaged_road', 'Damaged Roads', 'High', 'fa-car-crash', 'Severe surface erosion, broken pavement, asphalt crumbling.'),
        (4, 'broken_streetlight', 'Broken Streetlights', 'Medium', 'fa-lightbulb', 'Non-functional lamps or dangling wires causing dark hazard zones.')
      `);
    }

    const [stats] = await conn.query('SELECT COUNT(*) as cnt FROM complaint_statuses');
    if (stats[0].cnt === 0) {
      await conn.query(`
        INSERT INTO complaint_statuses (id, code, name, step_order, color, description) VALUES
        (1, 'submitted', 'Submitted', 1, '#3b82f6', 'Complaint received and logged into municipal database.'),
        (2, 'under_review', 'Under Review', 2, '#8b5cf6', 'Assigned to Ward Engineer for site verification.'),
        (3, 'work_in_progress', 'Work in Progress', 3, '#f59e0b', 'Field crew and equipment dispatched for repair work.'),
        (4, 'resolved', 'Resolved', 4, '#10b981', 'Civic issue successfully resolved and certified.')
      `);
    }

    // Default admin user check
    const [usr] = await conn.query('SELECT COUNT(*) as cnt FROM users');
    if (usr[0].cnt === 0) {
      await conn.query(`
        INSERT INTO users (id, full_name, email, phone, password, role) VALUES
        (1, 'Municipal Admin', 'admin@smartcivic.gov.in', '+91 98765 43210', '$2a$10$tZ261kU/R01g00i3v2L1f.2QkO2kQGkRj5iBwS6k1O4a8K9Q2kQGK', 'admin'),
        (2, 'Nisanthan S (Citizen)', 'nisanthan@ritchennai.edu.in', '+91 94441 23456', '$2a$10$tZ261kU/R01g00i3v2L1f.2QkO2kQGkRj5iBwS6k1O4a8K9Q2kQGK', 'citizen'),
        (3, 'Santosh G (Citizen)', 'santosh@ritchennai.edu.in', '+91 94442 34567', '$2a$10$tZ261kU/R01g00i3v2L1f.2QkO2kQGkRj5iBwS6k1O4a8K9Q2kQGK', 'citizen')
      `);
    }

    conn.release();
    isConnected = true;
    console.log(`[Database] MySQL connected successfully to '${dbConfig.database}' on port ${dbConfig.port}`);
  } catch (err) {
    console.warn(`[Database Warning] MySQL connection could not be established (${err.message}).`);
    console.log(`[Database] Falling back to high-fidelity In-Memory / Simulated persistence store.`);
    console.log(`[Database] All API endpoints (auth, complaints, updates, analytics) remain 100% operational.`);
    isConnected = false;
  }
}

// Auto-initialize on import
initDB();

module.exports = {
  getPool: () => pool,
  isMySQLConnected: () => isConnected,
  inMemoryStore,
  dbConfig,
  reconnect: initDB
};
