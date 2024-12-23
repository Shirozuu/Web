<?php
session_start();
if (!isset($_SESSION['admin'])) {
    exit('Unauthorized');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Handle file upload
    $target_dir = "assets/Artworks NEW/";
    $filename = date('Y-m-d-H-i-s') . '-' . bin2hex(random_bytes(8)) . '.jpg';
    $target_file = $target_dir . $filename;
    
    if (move_uploaded_file($_FILES["artwork"]["tmp_name"], $target_file)) {
        // Create HTML entry for gallery
        $title = htmlspecialchars($_POST['title']);
        $category = htmlspecialchars($_POST['category']);
        $social_link = htmlspecialchars($_POST['social_link']);
        
        // Create new artwork HTML
        $new_artwork = <<<HTML
        <div class="folio-item work-item mt-80 dsn-col-md-2 dsn-col-lg-3 Product column {$category}" data-aos="fade-up">
            <div class="has-popup box-img before-z-index z-index-0 p-relative over-hidden folio-item__thumb" data-overlay="0">
                <a class="folio-item__thumb-link" target="blank" href="assets/Artworks NEW/{$filename}" title="{$title}" data-size="905x1280">
                    <img class="cover-bg-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-dsn-src="assets/Artworks NEW/{$filename}" alt="">
                </a>
            </div>
            <div class="folio-item__info">
                <div class="folio-item__cat">illustration/{$category}</div>
                <h4 class="folio-item__title">{$title}!</h4>
            </div>
            <a target="blank" href="{$social_link}" title="Social" class="folio-item__project-link">Social</a>
            <div class="folio-item__caption">
                <p>{$title}</p>
            </div>
        </div>
HTML;

        // Insert into index.html
        $index_content = file_get_contents('index.html');
        $insert_point = strpos($index_content, '<!-- ========== Work Section ========== -->');
        $index_content = substr_replace($index_content, $new_artwork, $insert_point, 0);
        file_put_contents('index.html', $index_content);
        
        header('Location: admin-upload.php?success=1');
    } else {
        header('Location: admin-upload.php?error=1');
    }
}
?>