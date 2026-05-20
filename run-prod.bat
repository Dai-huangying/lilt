@echo off
set PATH=F:\;%PATH%
set NODE_ENV=production
cd f:\trae_projects\lilt-mvp
echo "NODE_ENV: %NODE_ENV%"
echo "Starting production server..."
F:\node.exe node_modules\next\dist\cli\next-start.js --port 3000
