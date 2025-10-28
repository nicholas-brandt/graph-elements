tsc -p ./
cd resources
# clean
rm -r dist
mkdir dist
# compile js
npx webpack --config webpack.config.js --mode production
# inline css and js into html
npx inline-source src/project.inline.html --compress > dist/project.html