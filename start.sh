#!/bin/bash

DIR="./node_modules"

echo Checking if node_modules exists...

if [ -d "$DIR" ]
then
  echo Folder node_modules exists.
  echo Building bot...
  npm run build:full
  echo Running bot...
  npm start
else
  echo Folder node_modules does not exists.
  echo Installing requirements packages...
  npm i
  echo Installing custom musicard...
  npm i https://github.com/RainyXeon/musicard.git
  echo Building bot...
  npm run build:full
  echo Running bot...
  npm start
fi