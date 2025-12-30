<?php
session_start();
session_destroy(); // Oturumu öldür
header("Location: index.php"); // Ana sayfaya at
exit;
?>