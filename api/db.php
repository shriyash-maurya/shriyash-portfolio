<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Securely grab your TiDB Cloud credentials from Vercel's Environment Variables
$host = getenv('DB_HOST');
$user = getenv('DB_USER');
$pass = getenv('DB_PASSWORD');
$dbname = getenv('DB_NAME') ?: 'test'; // Use the default cloud database namespace
$port = getenv('DB_PORT') ?: 4000;

// 1. Initialize MySQLi connection object
$conn = mysqli_init();
if (!$conn) {
    die(json_encode(["error" => "mysqli_init failed"]));
}

// 2. Clear SSL configurations to prep for TiDB Cloud mandatory secure handshake
$conn->ssl_set(NULL, NULL, NULL, NULL, NULL);

// 3. Connect using SSL flag
if (!$conn->real_connect($host, $user, $pass, $dbname, $port, NULL, MYSQLI_CLIENT_SSL)) {
    die(json_encode(["error" => "Database Connection Failed: " . mysqli_connect_error()]));
}

// --- AUTOMATIC SCHEMA CREATION (No "CREATE DATABASE" query to prevent security rejection) ---

$conn->query("CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(150),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$conn->query("CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$conn->query("CREATE TABLE IF NOT EXISTS projects (
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
)");

$conn->query("CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$conn->query("CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    issuer VARCHAR(200) NOT NULL,
    issue_date VARCHAR(50),
    icon VARCHAR(50),
    certificate_url VARCHAR(500),
    external_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// Insert default credentials securely
$defaultHash = password_hash('mypass@123', PASSWORD_DEFAULT);
$defaultHash = $conn->real_escape_string($defaultHash);
$conn->query("INSERT INTO admin_users (username, password_hash) VALUES ('sanu', '$defaultHash')
ON DUPLICATE KEY UPDATE username = VALUES(username), password_hash = VALUES(password_hash)");

// Seed blogs if table is completely empty
$blogCountResult = $conn->query("SELECT COUNT(*) AS cnt FROM blog_posts");
$blogCount = $blogCountResult ? (int)$blogCountResult->fetch_assoc()['cnt'] : 0;
if ($blogCount === 0) {
    $conn->query("INSERT INTO blog_posts (title, category, excerpt, content) VALUES
    ('How I Solved My First CTF Challenge on TryHackMe', 'security', 'A beginner-friendly walkthrough from recon to privilege escalation on TryHackMe.', 'A beginner-friendly walkthrough from recon to privilege escalation on TryHackMe. The post covers scanning, enumeration, exploiting common misconfigurations, and the mindset needed to progress from beginner to confident CTF player.'),
    ('Building a Secure REST API with Node.js and JWT Auth', 'dev', 'A practical guide to securing APIs with JWT, validation, and rate limiting.', 'A practical guide to securing APIs with JWT, validation, and rate limiting. This article explains token flow, password hashing, input validation, and how to design secure endpoints that scale responsibly.'),
    ('10 Linux Terminal Commands Every Security Researcher Must Know', 'tips', 'The commands I rely on most during network checks, scanning, and incident response.', 'The commands I rely on most during network checks, scanning, and incident response. From netstat and tcpdump to grep and curl, these commands help speed up discovery and troubleshooting during security assessments.'),
    ('Why I Prefer Python for Automation and Security Tools', 'dev', 'A look at why Python remains one of the fastest ways to build useful automation scripts and small security utilities.', 'A look at why Python remains one of the fastest ways to build useful automation scripts and small security utilities. The article covers readability, libraries, quick prototyping, and the balance between speed and reliability.'),
    ('How to Write Cleaner Code for Real Projects', 'tips', 'Practical habits that make code easier to maintain, review, and deploy confidently.', 'Practical habits that make code easier to maintain, review, and deploy confidently. This post explores naming conventions, modular design, comments that explain intent, and testing strategies that save time later.'),
    ('A Simple Roadmap for Becoming Better at Cyber Security', 'security', 'A realistic learning plan for anyone trying to grow from beginner to capable security enthusiast.', 'A realistic learning plan for anyone trying to grow from beginner to capable security enthusiast. The roadmap includes networking, Linux basics, web security, scripting, and how to practice safely with labs and CTFs.'),
    ('What I Learned Building My First Full-Stack Web App', 'dev', 'Lessons from building an end-to-end application that combined frontend design, backend logic, and deployment.', 'Lessons from building an end-to-end application that combined frontend design, backend logic, and deployment. This post covers planning, API design, debugging, and the importance of keeping user experience simple.')");
}

// Seed projects if table is completely empty
$projectCountResult = $conn->query("SELECT COUNT(*) AS cnt FROM projects");
$projectCount = $projectCountResult ? (int)$projectCountResult->fetch_assoc()['cnt'] : 0;
if ($projectCount === 0) {
    $conn->query("INSERT INTO projects (title, description, category, period, icon, featured, github_url, live_url, stack) VALUES
    ('Shriyash Portfolio', 'Personal portfolio website built to showcase projects, certificates, blog posts, and contact information.', 'web', '2026', '🌐', 1, 'https://github.com/shriyash-maurya/shriyash-portfolio', 'https://github.com/shriyash-maurya/shriyash-portfolio', 'HTML, CSS, JavaScript, PHP'),
    ('Basic Social Media', 'A simple social platform prototype with user interactions and content sharing features.', 'web', '2025', '📱', 1, 'https://github.com/shriyash-maurya/Basic-Social-media', 'https://github.com/shriyash-maurya/Basic-Social-media', 'JavaScript, HTML, CSS'),
    ('E-commerce Platform', 'A full-stack e-commerce application focused on product management and user flow.', 'web', '2025', '🛒', 1, 'https://github.com/shriyash-maurya/E-commerce', 'https://github.com/shriyash-maurya/E-commerce', 'Python, Flask, SQL'),
    ('Project Management Tool', 'Task tracking and team workflow application for better productivity and planning.', 'tool', '2025', '📋', 1, 'https://github.com/shriyash-maurya/Project-Management-tool', 'https://github.com/shriyash-maurya/Project-Management-tool', 'JavaScript, React, Node.js'),
    ('ATS Score Checker', 'Resume optimization tool that helps users improve ATS compatibility and score outcomes.', 'tool', '2025', '📄', 1, 'https://github.com/shriyash-maurya/ATS-score-checker', 'https://github.com/shriyash-maurya/ATS-score-checker', 'Python, Flask, PDF Parsing'),
    ('Automatic Attendance System', 'AI-powered attendance solution using face detection and verification to reduce proxy attendance.', 'security', '2025', '🤖', 1, 'https://github.com/shriyash-maurya/Automatic-Attendance-System-', 'https://github.com/shriyash-maurya/Automatic-Attendance-System-', 'Python, OpenCV, AI/ML'),
    ('Restaurant Management System', 'Application designed for managing orders, inventory, and restaurant operations.', 'web', '2025', '🍽️', 0, 'https://github.com/shriyash-maurya/restaurant-management', 'https://github.com/shriyash-maurya/restaurant-management', 'Python, SQL, UI'),
    ('GrowLoop', 'A growth-focused web project designed to showcase digital business ideas and branding.', 'web', '2025', '🌱', 0, 'https://github.com/shriyash-maurya/GrowLoop', 'https://github.com/shriyash-maurya/GrowLoop', 'HTML, CSS, JavaScript'),
    ('My Portfolio', 'Another portfolio project focused on presenting a clean personal brand and work history.', 'web', '2025', '🧑‍💻', 0, 'https://github.com/shriyash-maurya/My-Portfolio', 'https://github.com/shriyash-maurya/My-Portfolio', 'HTML, CSS, JavaScript')");
}
?>