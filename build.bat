@echo off
set PATH=F:\;%PATH%
cd f:\trae_projects\lilt-mvp
echo "Running build..."
F:\node.exe node_modules\next\dist\cli\next-build.js > build_output.txt 2>&1
echo "Build completed. Output saved to build_output.txt"
type build_output.txt
