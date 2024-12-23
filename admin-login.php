<?php
session_start();
$admin_user = "RUUUDY";
$admin_pass = "p$2y$10$P7HTZ40EZeN6ngIHTJaXPurWno6HvIYBtxF0GvYkg3UNXyZ6HeUnW"; // Generate using password_hash()

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($_POST['username'] === $admin_user && 
        password_verify($_POST['password'], $admin_pass)) {
        $_SESSION['admin'] = true;
        header('Location: admin-upload.php');
        exit();
    }
}

if (isset($_SESSION['admin'])) {
    header('Location: admin-upload.php');
    exit();
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin Login</title>
    <link href="assets/css/style.css" rel="stylesheet" />
</head>
<body>
    <div class="admin-login">
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    </div>
</body>
</html>