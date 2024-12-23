p<?php
$password = "RUUUDY"; // Replace with your desired password
$hash = password_hash($password, PASSWORD_DEFAULT);
echo $hash;
?>