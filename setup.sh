#!/bin/bash
set -e

# Install dependencies in client and server directories
for dir in client server; do
  echo "Installing dependencies in $dir..."
  (cd "$dir" && npm install --no-audit --no-fund)
done

echo "Installation completed."
