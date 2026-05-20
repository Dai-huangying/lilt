@echo off
set PATH=F:\;%PATH%
cd f:\trae_projects\lilt-mvp
echo "Starting server..."
F:\node.exe node_modules\next\dist\cli\next-dev.js --port 3000 > server_output.txt 2>&1
echo "Server exited"
type server_output.txt