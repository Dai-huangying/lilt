$env:PATH = 'F:\;' + $env:PATH
cd f:\trae_projects\lilt-mvp
& 'F:\node.exe' -e "require('next/dist/cli/next-dev').nextDev(['--port', '3000'])"