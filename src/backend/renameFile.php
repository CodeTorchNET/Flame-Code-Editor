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

// Check if the path starts with a slash and remove it
if ($PATH[0] == "/") {
    $PATH = substr($PATH, 1);
}

$PATH = "../projects/" . $PROJECTID . "/" . $PATH;
if (!file_exists($PATH)) {
    echo json_encode(array('status' => 'false', 'message' => 'File/Directory does not exist'));
    exit();
}

$OLDNAME = $_GET['ON'];
if (!isset($OLDNAME)) {
    echo json_encode(array('status' => 'false', 'message' => 'No old name provided'));
    exit();
}

$NEWNAME = $_GET['NN'];

if (!isset($NEWNAME)) {
    echo json_encode(array('status' => 'false', 'message' => 'No new name provided'));
    exit();
}

// Validate $OLDNAME and $NEWNAME
if (!is_string($OLDNAME) || !is_string($NEWNAME)) {
    echo json_encode(array('status' => 'false', 'message' => 'Invalid names'));
    exit();
}

$OlDLOCATION = $PATH . $OLDNAME;
$NEWLOCATION = $PATH . $NEWNAME;
if (!file_exists($OlDLOCATION)) {
    echo json_encode(array('status' => 'false', 'message' => 'File/Directory does not exist'));
    exit();
}
if (file_exists($NEWLOCATION)) {
    echo json_encode(array('status' => 'false', 'message' => 'File/Directory already exists'));
    exit();
}

// Rename file/directory
if (rename($OlDLOCATION, $NEWLOCATION)) {
    echo json_encode(array('status' => 'true', 'message' => 'File renamed successfully'));
} else {
    echo json_encode(array('status' => 'false', 'message' => 'Failed to rename file'));
    http_response_code(500);
}
?>