echo "Checking if node_modules exists..."

IF exist node_modules (
  echo "Folder node_modules exists."
	echo "Building bot..."
	npm run build:full
	echo "Starting bot..."
	npm start
) ELSE (
  echo "Folder node_modules does not exists."
  echo "Installing requirements packages..."
  npm i
	echo "Building bot..."
  npm run build:full
	echo "Starting bot..."
	npm start
)