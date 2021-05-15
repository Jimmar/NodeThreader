#!/usr/bin/env sh

# abort on errors
set -e

# build
# echo Linting..
# npm run lint
echo Building. this may take a minute...
npm run build

cd ../dist

echo Deploying ..
echo "`date`"
git add -A
git commit -m "deploy at `date`"

git push -f https://github.com/Jimmar/NodeThreader.git gh-pages

cd -
