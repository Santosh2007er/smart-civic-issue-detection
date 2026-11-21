-- ========================================================
-- AI-Powered Smart Civic Issue Detection Database Schema
-- Designathon 2.0 2026 | Team: DYNAMIC TRIO
-- Institution: Rajalakshmi Institute of Technology
-- ========================================================

CREATE DATABASE IF NOT EXISTS smart_civic_db;
USE smart_civic_db;

-- 1. Users Table (Citizens, Municipal Officers, Admins)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('citizen', 'admin', 'officer') DEFAULT 'citizen',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Issue Categories Table
CREATE TABLE IF NOT EXISTS issue_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    default_severity ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    icon VARCHAR(50) DEFAULT 'exclamation-circle',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Complaint Statuses Table
CREATE TABLE IF NOT EXISTS complaint_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    step_order INT NOT NULL,
    color VARCHAR(20) DEFAULT '#2563eb',
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Complaints Master Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES issue_categories(id),
    FOREIGN KEY (status_id) REFERENCES complaint_statuses(id)
);

-- 5. Locations Table
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 6. Status History / Audit Trail
CREATE TABLE IF NOT EXISTS complaint_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    status_id INT NOT NULL,
    changed_by INT DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES complaint_statuses(id),
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);
