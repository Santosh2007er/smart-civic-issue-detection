-- ========================================================
-- Seed Data for Smart Civic Issue Detection
-- Team: DYNAMIC TRIO | Rajalakshmi Institute of Technology
-- ========================================================

USE smart_civic_db;

-- Insert Standard Issue Categories
INSERT INTO issue_categories (id, code, name, default_severity, icon, description) VALUES
(1, 'pothole', 'Potholes', 'High', 'fa-road', 'Deep holes or cracks in asphalt creating high risk of vehicular accidents and tire damage.'),
(2, 'garbage', 'Garbage Accumulation', 'Medium', 'fa-trash-alt', 'Overflowing waste dumpsters, unattended street garbage heaps, or illegal dumping affecting public sanitation.'),
(3, 'damaged_road', 'Damaged Roads', 'High', 'fa-car-crash', 'Severe surface erosion, broken pavement, asphalt crumbling, or missing manhole covers on roadways.'),
(4, 'broken_streetlight', 'Broken Streetlights', 'Medium', 'fa-lightbulb', 'Non-functional lamps, dangling electrical wires, or unlit poles posing safety hazards at night.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Complaint Lifecycle Statuses
INSERT INTO complaint_statuses (id, code, name, step_order, color, description) VALUES
(1, 'submitted', 'Submitted', 1, '#3b82f6', 'Complaint received and logged into municipal database with AI classification.'),
(2, 'under_review', 'Under Review', 2, '#8b5cf6', 'Assigned to Ward Junior Engineer for physical site inspection and verification.'),
(3, 'work_in_progress', 'Work in Progress', 3, '#f59e0b', 'Maintenance crew and equipment dispatched to location for corrective action.'),
(4, 'resolved', 'Resolved', 4, '#10b981', 'Civic issue successfully repaired, verified with inspection sign-off.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Default Users
-- Passwords below are hashed for 'admin123' and 'citizen123' using bcrypt (cost 10)
-- $2a$10$WqB8K6u09mN9eN2qZ8V/ee0L0gKrk9W8k9X5v/8L7T3aG.zVnKzSy = admin123
-- $2a$10$aJ5y7Cq5tVpZ3sO6d1yG8e/6I3V5sU8aG9v2Y4d0nB3cE1r8T4y1K = citizen123
INSERT INTO users (id, full_name, email, phone, password, role) VALUES
(1, 'Municipal Admin', 'admin@smartcivic.gov.in', '+91 98765 43210', '$2a$10$tZ261kU/R01g00i3v2L1f.2QkO2kQGkRj5iBwS6k1O4a8K9Q2kQGK', 'admin'),
(2, 'Nisanthan S (Citizen)', 'nisanthan@ritchennai.edu.in', '+91 94441 23456', '$2a$10$tZ261kU/R01g00i3v2L1f.2QkO2kQGkRj5iBwS6k1O4a8K9Q2kQGK', 'citizen'),
(3, 'Santosh G (Citizen)', 'santosh@ritchennai.edu.in', '+91 94442 34567', '$2a$10$tZ261kU/R01g00i3v2L1f.2QkO2kQGkRj5iBwS6k1O4a8K9Q2kQGK', 'citizen'),
(4, 'Sooriya Vigneshwaran R', 'sooriya@ritchennai.edu.in', '+91 94443 45678', '$2a$10$tZ261kU/R01g00i3v2L1f.2QkO2kQGkRj5iBwS6k1O4a8K9Q2kQGK', 'officer')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Insert Realistic Sample Complaints in Chennai & RIT vicinity
INSERT INTO complaints (id, tracking_id, user_id, category_id, custom_category, title, description, image_url, severity, status_id, ai_detected_category, ai_confidence, is_ai_corrected, admin_notes, created_at) VALUES
(1, 'CIVIC-2026-1001', 2, 1, 'Potholes', 'Critical deep pothole near RIT College entrance', 'Extremely dangerous 1.5 ft pothole causing two-wheelers to skid near the Bangalore Highway service road crossing.', '/uploads/samples/pothole1.jpg', 'High', 3, 'Potholes', 96.40, 0, 'Road maintenance unit #4 dispatched with asphalt cold-mix.', DATE_SUB(NOW(), INTERVAL 2 DAY)),

(2, 'CIVIC-2026-1002', 3, 2, 'Garbage Accumulation', 'Overflowing community garbage dump on Poonamallee High Rd', 'Garbage containers overflowing onto pedestrian walkway. Stray animals scattering plastic waste. Strong foul odor.', '/uploads/samples/garbage1.jpg', 'High', 2, 'Garbage Accumulation', 94.80, 0, 'Ward sanitary inspector notified; hydraulic compactor scheduled for 2:00 PM.', DATE_SUB(NOW(), INTERVAL 1 DAY)),

(3, 'CIVIC-2026-1003', 2, 4, 'Broken Streetlights', 'Blackout along Kuthambakkam main link road', 'Three continuous LED streetlights are non-functional for past 4 nights. Poses severe safety risk to female students and night commuters.', '/uploads/samples/streetlight1.jpg', 'Medium', 1, 'Broken Streetlights', 91.50, 0, 'Report assigned to TANGEDCO electrical maintenance wing.', DATE_SUB(NOW(), INTERVAL 6 HOUR)),

(4, 'CIVIC-2026-1004', 3, 3, 'Damaged Roads', 'Cracked tarmac and loose gravel near Chembarambakkam junction', 'Severe road top layer erosion post recent rains. Heavy vehicles bouncing, gravel hitting windshields of smaller vehicles.', '/uploads/samples/damaged_road1.jpg', 'Medium', 4, 'Damaged Roads', 95.20, 0, 'Patchwork and resurfacing completed and signed off by Zonal Engineer.', DATE_SUB(NOW(), INTERVAL 4 DAY)),

(5, 'CIVIC-2026-1005', 2, 1, 'Potholes', 'Multiple consecutive potholes on Avadi - Poonamallee road', 'Cluster of four rain-filled craters in front of bus shelter. Water splashing on pedestrians and school children.', '/uploads/samples/pothole2.jpg', 'High', 2, 'Potholes', 98.10, 0, 'Barricades placed by traffic police. Paving crew in transit.', DATE_SUB(NOW(), INTERVAL 12 HOUR))
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Insert Corresponding Geographic Locations
INSERT INTO locations (id, complaint_id, latitude, longitude, address, landmark, ward, city, postal_code) VALUES
(1, 1, 13.012500, 80.004100, 'Bangalore High Road, Chembarambakkam', 'Opposite Rajalakshmi Institute of Technology Entrance Gate', 'Ward 12', 'Chennai', '600124'),
(2, 2, 13.048900, 80.093400, 'Poonamallee Trunk Road, Near Bus Terminus', 'Adjacent to Poonamallee Municipal Market', 'Ward 18', 'Poonamallee', '600056'),
(3, 3, 13.019800, 80.015200, 'Kuthambakkam Link Road', 'Near Proposed Bus Port Project Site', 'Ward 14', 'Chennai', '600124'),
(4, 4, 13.008400, 80.019500, 'Chembarambakkam Lake View Road', 'Near Chembarambakkam Water Works Bridge', 'Ward 15', 'Chennai', '600124'),
(5, 5, 13.061200, 80.104200, 'Avadi - Poonamallee Main Road', 'Near Paruthipattu Green Park Junction', 'Ward 21', 'Avadi', '600071')
ON DUPLICATE KEY UPDATE address=VALUES(address);
