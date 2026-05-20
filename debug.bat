@echo off
set PATH=F:\;%PATH%
cd f:\trae_projects\lilt-mvp
echo "Node.js version:"
F:\node.exe --version
echo "npm version:"
F:\node.exe F:\node_modules\npm\bin\npm-cli.js --version
echo "Starting server with debug..."
F:\node.exe node_modules\next\dist\cli\next-start.js --port 3000 2>&1
pause
