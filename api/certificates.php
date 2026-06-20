<?php
session_start();
header('Content-Type: application/json');
include 'db.php';

function sanitizeText($value)
{
    return trim((string)($value ?? ''));
}

function makeUploadDirectory()
{
    $dir = __DIR__ . '/../uploads/certificates';
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
    return $dir;
}

function uploadCertificateFile($file)
{
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        return null;
    }

    if ($file['error'] !== UPLOAD_ERR_OK || (int)$file['size'] <= 0) {
        return null;
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
    if (!in_array($extension, $allowed, true)) {
        return null;
    }

    $targetDir = makeUploadDirectory();
    $filename = time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
    $targetPath = $targetDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        return null;
    }

    return '../uploads/certificates/' . $filename;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT id, title, issuer, issue_date, icon, certificate_url, external_url FROM certificates ORDER BY id DESC";
    $result = $conn->query($sql);
    $certificates = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $certificates[] = $row;
        }
    }

    echo json_encode(['status' => 'success', 'certificates' => $certificates]);
    $conn->close();
    exit;
}

if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = sanitizeText($_POST['title'] ?? '');
    $issuer = sanitizeText($_POST['issuer'] ?? '');
    $issueDate = sanitizeText($_POST['issue_date'] ?? '');
    $icon = sanitizeText($_POST['icon'] ?? '');
    $externalUrl = sanitizeText($_POST['external_url'] ?? '');
    $id = (int)($_POST['certificateId'] ?? 0);

    if ($title === '' || $issuer === '') {
        echo json_encode(['status' => 'error', 'message' => 'Title and issuer are required']);
        exit;
    }

    $uploadedUrl = uploadCertificateFile($_FILES['certificateFile'] ?? []) ?? '';

    if ($id > 0) {
        if ($uploadedUrl !== '') {
            $stmt = $conn->prepare('UPDATE certificates SET title = ?, issuer = ?, issue_date = ?, icon = ?, certificate_url = ?, external_url = ? WHERE id = ?');
            $stmt->bind_param('ssssssi', $title, $issuer, $issueDate, $icon, $uploadedUrl, $externalUrl, $id);
        } else {
            $stmt = $conn->prepare('UPDATE certificates SET title = ?, issuer = ?, issue_date = ?, icon = ?, external_url = ? WHERE id = ?');
            $stmt->bind_param('sssssi', $title, $issuer, $issueDate, $icon, $externalUrl, $id);
        }

        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Certificate updated']);
        } else {
            echo json_encode(['status' => 'error', 'message' => $stmt->error]);
        }

        $stmt->close();
        $conn->close();
        exit;
    }

    $stmt = $conn->prepare('INSERT INTO certificates (title, issuer, issue_date, icon, certificate_url, external_url) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('ssssss', $title, $issuer, $issueDate, $icon, $uploadedUrl, $externalUrl);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Certificate added']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $raw = file_get_contents('php://input');
    $data = $raw ? json_decode($raw, true) : [];
    $id = (int)($data['id'] ?? 0);

    if ($id <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Certificate id is required']);
        exit;
    }

    $stmt = $conn->prepare('DELETE FROM certificates WHERE id = ?');
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Certificate deleted']);
    } else {
        echo json_encode(['status' => 'error', 'message' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Unsupported request method']);
$conn->close();
