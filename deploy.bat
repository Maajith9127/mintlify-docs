@echo off
if "%~1"=="" (
    set msg=Update docs
) else (
    set msg=%*
)
git add .
git commit -m "%msg%"
git push
echo Done!
pause
