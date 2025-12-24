<?php
session_start();
session_destroy(); // Oturumu öldür
header("Location: index.html"); // Ana sayfaya at
exit;
?>