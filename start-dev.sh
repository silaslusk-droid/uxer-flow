#!/bin/bash

echo "Starting Sitemap Generator Development Environment..."
echo

echo "Installing dependencies..."
npm run install:all
if [ $? -ne 0 ]; then
    echo "Error installing dependencies!"
    exit 1
fi

echo
echo "Starting development servers..."
echo "Backend will be available at: http://localhost:3000"
echo "Frontend will be available at: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers"
echo

npm run dev
