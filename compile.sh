#!/bin/bash
compile() {
    echo compile: $1
    name=`echo "$(basename $1)" | cut -d'.' -f1`
    node_modules/.bin/babel $1 -o $name.c.js -m system 
}
find . ! -path "./node_modules/*" -type f -regextype posix-extended -regex "(.+\.c(\.min)?\.js)$" -exec rm {} \;
find . ! -path "./node_modules/*" -type f -regextype posix-extended -regex "(.+\.js)$" | while read file; do compile "$file"; done