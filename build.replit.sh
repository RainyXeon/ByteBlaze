echo "INFO - ByteBlaze replit build script"
echo "INFO - Version: 1.0.0"
echo "INFO - Building bot..."
npm run build:prettier
npm run build
npm run build:manifest
npm run build:languages
echo "INFO - Finished building bot!"