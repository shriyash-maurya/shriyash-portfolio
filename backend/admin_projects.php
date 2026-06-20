<?php
session_start();
header('Content-Type: application/json');
include 'db.php';

if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

function readJsonBody()
{
    $raw = file_get_contents('php://input');
    return $raw ? json_decode($raw, true) : [];
}

function validateProject($data)
{
    $required = ['title', 'description', 'category'];
    foreach ($required as $field) {
        if (empty(trim((string)($data[$field] ?? '')))) {
            return false;
        }
    }
    return true;
}

global $conn;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT id, title, description, category, period, icon, featured, github_url, live_url, stack FROM projects ORDER BY id DESC";
    $result = $conn->query($sql);
    $projects = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $projects[] = $row;
        }
    }
    echo json_encode(['status' => 'success', 'projects' => $projects]);
    $conn->close();
    exit;
}

$data = readJsonBody();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateProject($data)) {
        echo json_encode(['status' => 'error', 'message' => 'Title, description, and category are required']);
        exit;
    }

    $title = trim($data['title']);
    $description = trim($data['description']);
    $category = trim($data['category']);
    $period = trim($data['period'] ?? '');
    $icon = trim($data['icon'] ?? '');
    $featured = isset($data['featured']) && $data['featured'] ? 1 : 0;
    $github_url = trim($data['github_url'] ?? '');
    $live_url = trim($data['live_url'] ?? '');
    $stack = trim($data['stack'] ?? '');

    $stmt = $conn->prepare('INSERT INTO projects (title, description, category, period, icon, featured, github_url, live_url, stack) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('sssssisss', $title, $description, $category, $period, $icon, $featured, $github_url, $live_url, $stack);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Project added']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (empty($data['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Project id is required']);
        exit;
    }

    $id = (int)$data['id'];
    if (!validateProject($data)) {
        echo json_encode(['status' => 'error', 'message' => 'Title, description, and category are required']);
        exit;
    }

    $title = trim($data['title']);
    $description = trim($data['description']);
    $category = trim($data['category']);
    $period = trim($data['period'] ?? '');
    $icon = trim($data['icon'] ?? '');
    $featured = isset($data['featured']) && $data['featured'] ? 1 : 0;
    $github_url = trim($data['github_url'] ?? '');
    $live_url = trim($data['live_url'] ?? '');
    $stack = trim($data['stack'] ?? '');

    $stmt = $conn->prepare('UPDATE projects SET title = ?, description = ?, category = ?, period = ?, icon = ?, featured = ?, github_url = ?, live_url = ?, stack = ? WHERE id = ?');
    $stmt->bind_param('sssssisssi', $title, $description, $category, $period, $icon, $featured, $github_url, $live_url, $stack, $id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Project updated']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (empty($data['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Project id is required']);
        exit;
    }

    $id = (int)$data['id'];
    $stmt = $conn->prepare('DELETE FROM projects WHERE id = ?');
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Project deleted']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Unsupported request method']);
$conn->close();
