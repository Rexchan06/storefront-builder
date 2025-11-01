@echo off
echo Running Laravel Tests...
echo.

php vendor/bin/pest --no-coverage --no-parallel

echo.
echo Tests completed!
pause
