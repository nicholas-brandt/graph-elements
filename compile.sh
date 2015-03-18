#!/bin/bash
find . ! -path "./node_modules/*" -type f -regextype posix-extended -regex "(.+\.c(\.min)?\.js)$" -exec rm {} \;
find . ! -path "./node_modules/*" -type f -regextype posix-extended -regex "(.+\.js)$" | while read file; do
name=${file##.*/}
path=${file%/*}
raw=${name%%js}
newname=${path%/*}/bin/${raw}c.js
echo "compile: $file => $newname"
node_modules/.bin/babel $file -o $newname -m system -e
done