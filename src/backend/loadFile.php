<?php
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Cache-Control: no-cache");
header("Pragma: no-cache");

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

// Validate $PROJECTID and $PATH
if (!is_string($PROJECTID) || !preg_match('/^[a-zA-Z0-9]+$/', $PROJECTID)) {
    echo json_encode(array('status' => 'false', 'message' => 'Invalid project ID'));
    exit();
}

if (!is_string($PATH) || preg_match('/\.\./', $PATH)) {
    echo json_encode(array('status' => 'false', 'message' => 'Invalid path'));
    exit();
}

$file_path = '../projects/' . $PROJECTID . $PATH;

// Check if the file exists
if (!file_exists($file_path)) {
    echo json_encode(array('status' => 'false', 'message' => 'File not found'));
    exit();
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file_path);
finfo_close($finfo);

// Set proper content type header
header('Content-Type: ' . $mime);

// Output the file
readfile($file_path);
?>
