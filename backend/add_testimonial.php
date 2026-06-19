<?php
header('Content-Type: application/json');
include 'db.php';

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    echo json_encode(['status'=>'error','message'=>'Invalid request']);
    exit;
}

$name = trim($_POST['name'] ?? '');
$role = trim($_POST['role'] ?? '');
$message = trim($_POST['message'] ?? '');

if(empty($name) || empty($message)){
    echo json_encode(['status'=>'error','message'=>'Name and message are required']);
    exit;
}

$stmt = $conn->prepare('INSERT INTO testimonials(name, role, message) VALUES (?, ?, ?)');
$stmt->bind_param('sss', $name, $role, $message);

if($stmt->execute()){
    echo json_encode(['status'=>'success']);
}else{
    echo json_encode(['status'=>'error','message'=>$stmt->error]);
}

$stmt->close();
$conn->close();
?>