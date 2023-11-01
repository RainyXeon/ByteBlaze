#!/bin/bash

print()
{
  now=$(date +'%d/%m/%Y %T')
  echo "$now - $1"
}

print "Checking if NodeJS exists..."

command="node"
if [ "$(which "$command")" != "" ]; 
then
  print "NodeJS found!"
else
  print "Error: NodeJS not found! Please install NodeJS in https://nodejs.org"
  exit 1
fi

print "Checking if npm exists..."

command="npm"
if [ "$(which "$command")" != "" ]; 
then
  print "npm found! Continue..."
else
  print "Error: npm not found! Please install NodeJS in https://nodejs.org"
  exit 1
fi

print "Checking if pnpm exists..."

command="pnpm"
if [ "$(which "$command")" != "" ]; 
then
  print "pnpm found! Continue..."
else
  print "pnpm not found! Installing pnpm..."
  npm i -g pnpm@latest
fi

print "Checking if node_modules exists..."

DIR="./node_modules"
if [ -d "$DIR" ]
then
  print "Folder node_modules exists."
  print "Rebuild canvas..."
  pnpm rebuild canvas
  print "Building bot..."
  pnpm build:full
  print "Running bot..."
  pnpm start
else
  print "Folder node_modules does not exists."
  print "Installing requirements packages..."
  pnpm i
  print "Rebuild canvas..."
  pnpm rebuild canvas
  print "Building bot..."
  pnpm build:full
  print "Running bot..."
  pnpm start
fi