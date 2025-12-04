@echo off
set /p msg="Commit message: "
git add .
git commit -m "%msg%"
git push
echo Done! Changes pushed to GitHub.
pause
