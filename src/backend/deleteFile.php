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
//check if file/directory exists

if($PATH[0] == "/"){
    $PATH = substr($PATH, 1);
}

$PATH = "../projects/" . $PROJECTID . "/" . $PATH;
if (!file_exists($PATH)) {
    echo json_encode(array('status' => 'false', 'message' => 'File/Directory does not exist'));
    exit();
}
//delete file/directory
if (is_dir($PATH)) {
    //function to delete dictionaries content infinite depth
    function deleteDir($dirPath) {
        if (!is_dir($dirPath)) {
            throw new InvalidArgumentException("$dirPath must be a directory");
        }
    
        $files = scandir($dirPath);
        
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                $filePath = $dirPath . '/' . $file;
    
                if (is_dir($filePath)) {
                    deleteDir($filePath);
                } else {
                    unlink($filePath);
                }
            }
        }
    
        unset($files);
        rmdir($dirPath);
    }
    deleteDir($PATH);
    echo json_encode(array('status' => 'true', 'message' => 'Directory deleted successfully'));
} else {
    if (unlink($PATH)) {
        echo json_encode(array('status' => 'true', 'message' => 'File deleted successfully'));
    } else {
        echo json_encode(array('status' => 'false', 'message' => 'Failed to delete file'));
        http_response_code(500);
    }
}

?>