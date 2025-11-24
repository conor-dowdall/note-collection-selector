#!/bin/bash

# This script automates the release process.
# It updates the version in deno.json, commits the change,
# creates an annotated git tag, and pushes to origin.

# Exit immediately if a command exits with a non-zero status.
set -e

# Check if jq is installed, as it's required to parse JSON.
if ! command -v jq &> /dev/null; then
  echo "Error: jq is not installed. Please install it to continue." >&2
  exit 1
fi

# 1. Get the new version number from the first argument.
VERSION=$1
MESSAGE=$2 # Optional second argument for the release message.
if [ -z "$VERSION" ]; then
  echo "Error: No version specified."
  echo "Usage: ./release.sh <version> [\"release message\"]"
  echo "Example: ./release.sh 19.1.0 \"Adds support for Harmonic Minor Modes.\""
  exit 1
fi

# 2. Update the version in deno.json.
echo "Updating deno.json to version $VERSION..."
jq --arg v "$VERSION" '.version = $v' deno.json > deno.json.tmp && mv deno.json.tmp deno.json

# 3. Commit the version bump.
echo "Committing version update..."
git add deno.json
git commit -m "chore: release v$VERSION"

# 4. Create an annotated git tag.
TAG_NAME="v$VERSION"

# Prepare the tag body message. Use the provided message or a default.
if [ -z "$MESSAGE" ]; then
  MESSAGE="Release of version $VERSION."
fi

echo "Creating git tag '$TAG_NAME'..."
# The -F/--file=- flag reads the message from standard input.
git tag -a "$TAG_NAME" -F - <<EOF
Version $VERSION

${MESSAGE}
EOF

# 5. Push the commit and the tag to the remote repository.
echo "Pushing commit and tag to origin..."
git push origin main
git push origin "$TAG_NAME"

echo "Release process for $TAG_NAME complete. The publish workflow should now be running."