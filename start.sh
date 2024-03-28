#!/bin/bash

DIR="./node_modules"
if [ -d "$DIR" ]
then
	echo "Folder node_modules exists."
	echo "Building bot..."
  npm run build:full
	echo "Starting bot..."
	npm start
else
	echo "Folder node_modules does not exists."
	echo "Installing requirements packages..."
	npm i
	echo "Building bot..."
  npm run build:full
	echo "Starting bot..."
	npm start
fi