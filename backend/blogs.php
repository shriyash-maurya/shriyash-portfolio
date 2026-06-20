<?php
session_start();
header('Content-Type: application/json');
include 'db.php';

function readJsonBody()
{
    $raw = file_get_contents('php://input');
    return $raw ? json_decode($raw, true) : [];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT id, title, category, excerpt, content, created_at FROM blog_posts ORDER BY id DESC";
    $result = $conn->query($sql);
    $posts = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $posts[] = $row;
        }
    }
    echo json_encode(['status' => 'success', 'posts' => $posts]);
    $conn->close();
    exit;
}

if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$data = readJsonBody();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty(trim((string)($data['title'] ?? ''))) || empty(trim((string)($data['excerpt'] ?? '')))) {
        echo json_encode(['status' => 'error', 'message' => 'Title and excerpt are required']);
        exit;
    }

    $title = trim($data['title']);
    $category = trim($data['category'] ?? 'dev');
    $excerpt = trim($data['excerpt']);
    $content = trim($data['content'] ?? '');

    $stmt = $conn->prepare('INSERT INTO blog_posts (title, category, excerpt, content) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('ssss', $title, $category, $excerpt, $content);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Blog post added']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    if (empty($data['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Post id is required']);
        exit;
    }

    if (empty(trim((string)($data['title'] ?? ''))) || empty(trim((string)($data['excerpt'] ?? '')))) {
        echo json_encode(['status' => 'error', 'message' => 'Title and excerpt are required']);
        exit;
    }

    $id = (int)$data['id'];
    $title = trim($data['title']);
    $category = trim($data['category'] ?? 'dev');
    $excerpt = trim($data['excerpt']);
    $content = trim($data['content'] ?? '');

    $stmt = $conn->prepare('UPDATE blog_posts SET title = ?, category = ?, excerpt = ?, content = ? WHERE id = ?');
    $stmt->bind_param('ssssi', $title, $category, $excerpt, $content, $id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Blog post updated']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (empty($data['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Post id is required']);
        exit;
    }

    $id = (int)$data['id'];
    $stmt = $conn->prepare('DELETE FROM blog_posts WHERE id = ?');
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Blog post deleted']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Unsupported request method']);
$conn->close();
