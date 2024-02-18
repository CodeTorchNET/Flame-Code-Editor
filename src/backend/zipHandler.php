<?php

//File location override
$location = '../projects/';
//check if ../../CodeTorchOverride.php exists
if(file_exists(__DIR__ . '/../../CodeTorchOverride.php')){
    include(__DIR__ . '/../../CodeTorchOverride.php');
    if(isset($zipHandlerLocation)){
        $location = $zipHandlerLocation;
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
    // Set the input folder
    $PROJECTID = $_GET['PID'] ?? null;
    $path = $_GET['path'] ?? null;

    if (!$PROJECTID) {
        echo json_encode(array('status' => 'false', 'message' => 'No project ID provided'));
        exit();
    }
    if (!$path) {
        echo json_encode(array('status' => 'false', 'message' => 'No path provided'));
        exit();
    }

    // Validate project ID
    if (!ctype_alnum($PROJECTID)) {
        echo json_encode(array('status' => 'false', 'message' => 'Invalid project ID'));
        exit();
    }

    // Validate and sanitize path
    $path = ltrim($path, '/'); // Remove leading slashes
    $path = preg_replace('/\.\.\//', '', $path); // Remove any ".." sequences

    $inputFolder = $location . $PROJECTID . '/' . $path;
    $zipFileName = 'CodeTorch-Project.zip';

    //check if the input folder exists
    if (!file_exists($inputFolder)) {
        die('The input folder does not exist');
    }

    // Create a temporary zip file
    $tempZipFile = tempnam(sys_get_temp_dir(), 'zip');

    // Initialize ZipArchive
    $zip = new ZipArchive();
    if ($zip->open($tempZipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
        die('Failed to create zip archive');
    }

    // Add files from input folder to the zip
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($inputFolder), RecursiveIteratorIterator::LEAVES_ONLY);
    foreach ($files as $name => $file) {
        // Skip directories (they would be added automatically)
        if (!$file->isDir()) {
            // Get real and relative path for current file
            $filePath = $file->getRealPath();
            $relativePath = substr($filePath, strlen(dirname(realpath($inputFolder))) + 1);
            // Add current file to archive
            $zip->addFile($filePath, $relativePath);
        }
    }

    // Close and save the zip file
    $zip->close();

    // Set headers for force download
    header("Content-Type: application/zip");
    header("Content-Disposition: attachment; filename=\"" . $zipFileName . "\"");
    header("Content-Length: " . filesize($tempZipFile));
    header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
    header("Cache-Control: no-cache");
    header("Pragma: no-cache");

    // Send the zip file to the browser
    readfile($tempZipFile);

    // Delete the temporary zip file
    unlink($tempZipFile);
}
?>
