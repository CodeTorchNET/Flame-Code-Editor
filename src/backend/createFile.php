<?php
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Cache-Control: no-cache");
header("Pragma: no-cache");


$type = $_GET['type'];
if($type != 'file' && $type != 'folder'){
    echo json_encode(array('status' => 'false', 'message' => 'Invalid type'));
    exit();
}

$Data = file_get_contents('php://input');
if($type == 'file'){
if(!isset($Data) || $Data == ''){
    $Data = '';
}else{
//split data by ',' as it is base64 encoded
$Data = explode(',', $Data);
$Data = $Data[1];
//decode the base64 data
$Data = base64_decode($Data);
if($Data == false){
    echo json_encode(array('status' => 'false', 'message' => 'Invalid data'));
    exit();
}

//make sure Data is less than 20MB
if(strlen($Data) > 20000000){
    echo json_encode(array('status' => 'false', 'message' => 'File size is too large'));
    exit();
}
}
}
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
    file_put_contents('../projects/' . $PROJECTID . $PATH . $fileName, $Data);
    //find mime type of file
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, '../projects/' . $PROJECTID . $PATH . $fileName);
    finfo_close($finfo);
    echo json_encode(array('status' => 'true', 'message' => 'File saved', 'mime' => $mime));
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