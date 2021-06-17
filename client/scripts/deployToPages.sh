#!/usr/bin/env sh

# abort on errors
set -e

# build
# echo Linting..
# npm run lint
echo Building. this may take a minute...
npm run build

cd ../dist
# copy index as 404 to avoid page not found for non-home urls
cp index.html 404.html

echo Deploying ..
echo "`date`"
git init
git add -A
git commit -m "deployed at `date`"

git push -f https://github.com/Jimmar/NodeThreader.git master:gh-pages

cd -
