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
    $PATH = $_GET['PATH'];

    // Validate $PROJECTID and $PATH
    if (!isset($PROJECTID) || !is_string($PROJECTID) || !preg_match('/^[a-zA-Z0-9]+$/', $PROJECTID)) {
        echo json_encode(array('status' => 'false', 'message' => 'Invalid project ID'));
        exit();
    }

    if (!isset($PATH) || !is_string($PATH) || preg_match('/\.\./', $PATH)) {
        echo json_encode(array('status' => 'false', 'message' => 'Invalid path'));
        exit();
    }

    //check if the file exists
    if (!file_exists('../projects/' . $PROJECTID . $PATH)) {
        echo json_encode(array('status' => 'false', 'message' => 'File does not exist'));
        exit();
    }

    file_put_contents('../projects/' . $PROJECTID . $PATH, $file_data);
    echo json_encode(array('status' => 'true', 'message' => 'File saved'));
} else {
    echo json_encode(array('status' => 'false', 'message' => 'Expected POST request'));
    exit();
}

?>