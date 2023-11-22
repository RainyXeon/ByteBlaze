#!/bin/bash

DIR="./node_modules"
if [ -d "$DIR" ]
then
  print "Folder node_modules exists."
  print "Running bot..."
  pnpm start
else
  print "Folder node_modules does not exists."
  print "Installing requirements packages..."
  pnpm i
  print "Running bot..."
  pnpm start
fi