<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['admin'])) {
    session_unset();
    session_destroy();
}

echo json_encode(['status' => 'success', 'message' => 'Logged out']);
