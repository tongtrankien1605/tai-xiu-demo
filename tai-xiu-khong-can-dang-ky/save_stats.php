<?php
header('Content-Type: text/plain');
$data = json_decode(file_get_contents('php://input'), true);
if ($data) {
    file_put_contents('game_stats.json', json_encode($data, JSON_PRETTY_PRINT));
    echo "Lưu thống kê thành công!";
} else {
    echo "Lỗi khi lưu thống kê!";
}
?>