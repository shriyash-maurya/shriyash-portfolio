CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(150),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  period VARCHAR(100),
  icon VARCHAR(50),
  featured TINYINT(1) DEFAULT 0,
  github_url VARCHAR(255),
  live_url VARCHAR(255),
  stack VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_users (username, password_hash) VALUES
('admin', '$2y$12$f9o0Vg.QiqGB2qmDPQZnxOAk8Kdamqg6.45fNJk.x4.M0XJlFPmka');

INSERT INTO projects (title, description, category, period, icon, featured, github_url, live_url, stack) VALUES
('Automated Attendance System (Face Recognition)', 'AI-powered attendance system achieving 98% detection accuracy for 50+ students.', 'security', 'Jan 2025 — Feb 2025', '🤖', 1, 'https://github.com/shriyash-maurya', 'https://example.com', 'Python, OpenCV, Face Recognition, AI/ML'),
('School Management System', 'Full-featured system for attendance, grades, and administration workflows.', 'web', 'Jan 2025 — Aug 2025', '🏫', 1, 'https://github.com/shriyash-maurya', 'https://example.com', 'JavaScript, SQL, HTML/CSS, CRUD'),
('ATS Resume Finder using AI', 'AI-powered resume analyzer improving ATS score compatibility.', 'tool', 'Mar 2025 — May 2025', '📄', 0, 'https://github.com/shriyash-maurya', 'https://example.com', 'Python, NLP, AI/ML, Flask');
