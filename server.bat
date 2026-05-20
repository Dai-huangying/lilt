@echo off
set PATH=F:\;%PATH%
cd f:\trae_projects\lilt-mvp
echo "Starting LILT server on port 3000..."
F:\node.exe .next\server\server.js --port 3000
