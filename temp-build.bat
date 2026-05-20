@echo off
set PATH=F:\;%PATH%
cd f:\trae_projects\lilt-mvp
echo "Running build..."
node node_modules\next\dist\cli\next-build.js > build-output.txt 2>&1
echo "Build completed. Check build-output.txt for details."