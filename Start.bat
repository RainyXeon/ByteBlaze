@echo off

:StartBot
echo "Running in .bat file, print save mode enabled"

echo "Checking if NodeJS exists..."

WHERE node
IF %ERRORLEVEL% == 0 (
  echo "NodeJS found!"
) ELSE (
  echo "Error: NodeJS not found! Please install NodeJS in https://nodejs.org"
  exit /b
)

echo "Checking if npm exists..."

WHERE npm
IF %ERRORLEVEL% == 0 (
  echo "npm found!"
) ELSE (
  echo "Error: NodeJS not found! Please install NodeJS in https://nodejs.org"
  exit /b
)

echo "Checking if pnpm exists..."

WHERE pnpm
IF %ERRORLEVEL% == 0 (
  echo "pnpm found!"
) ELSE (
  echo "pnpm not found! Installing pnpm..."
  npm i -g pnpm@latest
)

echo "Checking if node_modules exists..."

IF exist node_modules (
  echo "Folder node_modules exists."
  echo "Rebuild canvas..."
  pnpm rebuild canvas
  echo "Building bot..."
  pnpm build:full
  echo "Running bot..."
  pnpm start
) ELSE (
  echo "Folder node_modules does not exists."
  echo "Installing requirements packages..."
  pnpm i
  echo "Rebuild canvas..."
  pnpm rebuild canvas
  echo "Building bot..."
  pnpm build:full
  echo "Running bot..."
  pnpm start
)