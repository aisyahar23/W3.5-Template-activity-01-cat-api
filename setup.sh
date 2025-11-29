#!/bin/bash

# Dog CEO API Explorer - Local Development Setup Script
# This script helps students start a local server with one command

echo "🐕 Dog CEO API Explorer - Setup Script"
echo "======================================"
echo ""

# Check if Python is installed
if command -v python3 &> /dev/null; then
    echo "✅ Python3 found! Starting server..."
    echo ""
    echo "📡 Server starting at: http://localhost:8000"
    echo "📖 Open your browser to this URL to see your project!"
    echo ""
    echo "Press Ctrl+C to stop the server when you're done."
    echo "--------------------------------------"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ Python found! Starting server..."
    echo ""
    echo "📡 Server starting at: http://localhost:8000"
    echo "📖 Open your browser to this URL to see your project!"
    echo ""
    echo "Press Ctrl+C to stop the server when you're done."
    echo "--------------------------------------"
    python -m http.server 8000
elif command -v npx &> /dev/null; then
    echo "✅ Node.js found! Starting server..."
    echo ""
    echo "📡 Server starting at: http://localhost:8000"
    echo "📖 Open your browser to this URL to see your project!"
    echo ""
    echo "Press Ctrl+C to stop the server when you're done."
    echo "--------------------------------------"
    npx http-server -p 8000
else
    echo "❌ No suitable server found!"
    echo ""
    echo "Please install one of the following:"
    echo "  • Python 3: https://www.python.org/downloads/"
    echo "  • Node.js: https://nodejs.org/"
    echo ""
    echo "Or manually start a server with:"
    echo "  python3 -m http.server 8000"
    echo "  OR"
    echo "  npx http-server -p 8000"
    exit 1
fi