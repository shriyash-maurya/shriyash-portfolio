<?php
header('Content-Type: application/json');
include 'db.php';

$sql = "SELECT id, title, description, category, period, icon, featured, github_url, live_url, stack FROM projects ORDER BY featured DESC, id DESC";
$result = $conn->query($sql);

$projects = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['stack'] = $row['stack'] ? array_map('trim', explode(',', $row['stack'])) : [];
        $projects[] = $row;
    }
}

echo json_encode(['projects' => $projects]);

$conn->close();
