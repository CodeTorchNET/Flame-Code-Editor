<?php
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Cache-Control: no-cache");
header("Pragma: no-cache");



//File location override
$location = '../projects/';
//check if ../../CodeTorchOverride.php exists
if(file_exists(__DIR__ . '/../../CodeTorchOverride.php')){
    include(__DIR__ . '/../../CodeTorchOverride.php');
    if(isset($loadFileLocation)){
        $location = $loadFileLocation;
    }
    //check if function securityCheck exists
    if(function_exists('securityCheck')){
        securityCheck($_GET['PID'], 'main');
    }else{
        main();
    }
}else{
    main();
}

function main(){
    global $location;
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

    $file_path = $location . $PROJECTID . $PATH;

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
}
?>
