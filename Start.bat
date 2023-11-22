echo "Checking if node_modules exists..."

IF exist node_modules (
  echo "Folder node_modules exists."
  echo "Running bot..."
  pnpm start
) ELSE (
  echo "Folder node_modules does not exists."
  echo "Installing requirements packages..."
  pnpm i
  echo "Running bot..."
  pnpm start
)