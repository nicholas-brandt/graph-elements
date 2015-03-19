#!/bin/bash
find . ! -path "./node_modules/*" -type f -regextype posix-extended -regex "(.+\.c(\.min)?\.js)$" -exec rm {} \;
find . ! -path "./node_modules/*" -type f -regextype posix-extended -regex "(.+\.js)$" | while read file; do
name=${file##.*/}
path=${file%/*}
raw=${name%%js}
newname=${path%/*}/bin/${raw}c.js
min=${path%/*}/bin/${raw}c.min.js
if [[ $raw =~ \.m\.$ ]]; then
echo "compile module: $file => $newname"
node_modules/.bin/babel $file -o $newname -m system -e -c false
node_modules/.bin/babel $file -o $min -m system -e -c true
else
echo "compile script: $file => $newname"
node_modules/.bin/babel $file -o $newname -e -c false
node_modules/.bin/babel $file -o $min -e -c true
fi
done