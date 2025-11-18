<?php
echo "Loaded php.ini file: " . php_ini_loaded_file() . PHP_EOL;
echo "Additional ini files: " . php_ini_scanned_files() . PHP_EOL;
echo PHP_EOL;
echo "Current upload_max_filesize: " . ini_get('upload_max_filesize') . PHP_EOL;
echo "Current post_max_size: " . ini_get('post_max_size') . PHP_EOL;
