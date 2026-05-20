@echo off
set PATH=F:\;%PATH%
cd f:\trae_projects\lilt-mvp
echo "Running server..."
F:\node.exe node_modules\next\dist\cli\next-start.js --port 3000 > server.log 2>&1
echo "Server exited. Check server.log for details."
