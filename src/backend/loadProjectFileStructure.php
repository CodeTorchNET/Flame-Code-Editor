<?php
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Cache-Control: no-cache");
header("Pragma: no-cache");
header('Content-Type: application/json');

$PROJECTID = $_GET['PID'];
if (!isset($PROJECTID)) {
    echo json_encode(array('status' => 'false', 'message' => 'No project ID provided'));
    exit();
}

function listFilesRecursively($subfolder, $OGPath)
{
    $files = glob($subfolder . '/*');

    $fileInfoArray = [];

    foreach ($files as $file) {
        if (is_dir($file)) {
            $Finalfile = str_replace($OGPath . '/', '', $file);
            $Finalfile = substr($Finalfile, 0, -strlen(basename($file)));
            if($Finalfile == ''){
                $Finalfile = '/';
            }
            if($Finalfile[0] != '/'){
                $Finalfile = '/' . $Finalfile;
            }
            //add the directory to the file list
            $fileInfoArray[] = [
                'PATH' => $Finalfile,
                'TYPE' => 'folder',
                'FILENAME' => basename($file)
            ];
            // If $file is a directory, recursively call the function
            $fileInfoArray = array_merge($fileInfoArray, listFilesRecursively($file, $OGPath));
        } else {
            //remove the whole subfolder path from the file path
            $file = str_replace($OGPath . '/', '', $file);
            $fileName = basename($file);
            $file = substr($file, 0, -strlen($fileName));
            if($file == ''){
                $file = '/';
            }
            if($file[0] != '/'){
                $file = '/' . $file;
            }
            $fileInfoArray[] = [
                'PATH' => $file,
                'TYPE' => 'file',
                'FILENAME' => $fileName
            ];
        }
    }

    return $fileInfoArray;
}

$currentPath = __DIR__;
// Remove /backend from the end of the path
$currentPath = substr($currentPath, 0, -8);
$currentPath = $currentPath . '/projects/' . $PROJECTID;
$fileList = listFilesRecursively($currentPath,$currentPath);
//convert to JSON
echo json_encode(array('status'=>'true','files' => $fileList));
?>