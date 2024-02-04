<?php
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Cache-Control: no-cache");
header("Pragma: no-cache");

$PROJECTID = $_GET['PID'];
if (!isset($PROJECTID)) {
    echo json_encode(array('status' => 'false', 'message' => 'No project ID provided'));
    exit();
}

$PATH = $_GET['path'];
if (!isset($PATH)) {
    echo json_encode(array('status' => 'false', 'message' => 'No path provided'));
    exit();
}
$type = $_GET['type'];
if($type != 'file' && $type != 'folder'){
    echo json_encode(array('status' => 'false', 'message' => 'Invalid type'));
    exit();
}
$fileName = $_GET['name'];
if (!isset($fileName)) {
    echo json_encode(array('status' => 'false', 'message' => 'No file name provided'));
    exit();
}
if($type == 'file'){
    //check if the file exists
    if (file_exists('../projects/' . $PROJECTID . $PATH . $fileName)) {
        echo json_encode(array('status' => 'false', 'message' => 'File already exists'));
        exit();
    }
    file_put_contents('../projects/' . $PROJECTID . $PATH . $fileName, '');
    echo json_encode(array('status' => 'true', 'message' => 'File saved'));
}else{
    //check if the folder exists
    if (file_exists('../projects/' . $PROJECTID . $PATH . $fileName)) {
        echo json_encode(array('status' => 'false', 'message' => 'Folder already exists'));
        exit();
    }
    mkdir('../projects/' . $PROJECTID . $PATH . $fileName);
    echo json_encode(array('status' => 'true', 'message' => 'Folder created'));
}
?>