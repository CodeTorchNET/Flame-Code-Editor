<?php
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Cache-Control: no-cache");
header("Pragma: no-cache");



//File location override
$location = '../projects/';
//check if ../../CodeTorchOverride.php exists
if(file_exists(__DIR__ . '/../../CodeTorchOverride.php')){
    include(__DIR__ . '/../../CodeTorchOverride.php');
    if(isset($deleteFileLocation)){
        $location = $deleteFileLocation;
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

    // Check if file/directory exists
    if ($PATH[0] == "/") {
        $PATH = substr($PATH, 1);
    }

    $PATH = $location . $PROJECTID . "/" . $PATH;
    if (!file_exists($PATH)) {
        echo json_encode(array('status' => 'false', 'message' => 'File/Directory does not exist'));
        exit();
    }

    // Delete file/directory
    if (is_dir($PATH)) {
        // Function to delete directory contents recursively
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
}
?>