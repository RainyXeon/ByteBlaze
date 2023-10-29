@echo off

:StartBot

echo Checking if node_modules exists...

IF exist node_modules (
  echo Folder node_modules exists.
  echo Building bot...
  npm run build:full
  echo Running bot...
  npm start
  goto StartBot
) ELSE (
  echo Folder node_modules does not exists.
  echo Installing requirements packages...
  npm i
  echo Installing custom musicard...
  npm i https://github.com/RainyXeon/musicard.git
  echo Building bot...
  npm run build:full
  echo Running bot...
  npm start
  goto StartBot
)
