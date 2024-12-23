<?php
session_start();
if (!isset($_SESSION['admin'])) {
    header('Location: admin-login.php');
    exit();
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Upload Artwork</title>
    <link href="assets/css/style.css" rel="stylesheet" />
</head>
<body>
    <div class="admin-upload">
        <h2>Upload New Artwork</h2>
        <form action="process-upload.php" method="POST" enctype="multipart/form-data">
            <input type="file" name="artwork" accept="image/*" required>
            <input type="text" name="title" placeholder="Artwork Title" required>
            <select name="category" required>
                <option value="fanart">FanArt</option>
                <option value="occhara">OC</option>
                <option value="comm">Commission</option>
                <option value="male">Male</option>
                <option value="landscape">Splash Art</option>
                <option value="vtube">Vtubers</option>
            </select>
            <input type="text" name="social_link" placeholder="Social Media Link">
            <button type="submit">Upload</button>
        </form>
        <a href="logout.php">Logout</a>
    </div>
</body>
</html>