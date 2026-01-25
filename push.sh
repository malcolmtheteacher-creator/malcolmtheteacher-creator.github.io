#!/bin/bash

# Auto-push script for malcolmtheteacher-creator.github.io
# Usage: push-site "Your commit message"

# Default commit message if none provided
COMMIT_MSG="${1:-Update website}"

# Navigate to repo directory
cd ~/Documents/01_Work/malcolmtheteacher-creator.github.io

# Check if there are any changes to commit
if git diff --quiet && git diff --staged --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Add all changes
git add -A

# Commit with message
git commit -m "$COMMIT_MSG"

# Push to remote
git push origin main

echo "✓ Changes pushed successfully!"
