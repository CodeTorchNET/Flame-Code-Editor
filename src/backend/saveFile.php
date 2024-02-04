<?php
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Cache-Control: no-cache");
header("Pragma: no-cache");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
$file_data = file_get_contents('php://input');
if (!isset($file_data)) {
    echo json_encode(array('status' => 'false', 'message' => 'No file data provided'));
    exit();
}
$PROJECTID = $_GET['PID'];
if (!isset($PROJECTID)) {
    echo json_encode(array('status' => 'false', 'message' => 'No project ID provided'));
    exit();
}

$PATH = $_GET['PATH'];
if (!isset($PATH)) {
    echo json_encode(array('status' => 'false', 'message' => 'No path provided'));
    exit();
}
file_put_contents('../projects/' . $PROJECTID . $PATH, $file_data);
echo json_encode(array('status' => 'true', 'message' => 'File saved'));
}else{
    echo json_encode(array('status' => 'false', 'message' => 'Expected POST request'));
    exit();
}
?>