@echo off

title Byteblaze [GLOBAL]

:StartBot

IF exist node_modules (
  echo Folder node_modules exists. Building bot...
  npm run build
  echo Running bot...
  npm start
  goto StartBot
) ELSE (
  echo Folder node_modules does not exists. Running npm i command...
  npm i
  echo Building bot...
  npm run build
  echo Running bot...
  npm start
  goto StartBot
)
