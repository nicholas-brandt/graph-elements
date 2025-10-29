tsc -p ./
cd resources
# clean
rm -r dist
mkdir dist
# compile js
npx webpack --config webpack.config.js --mode production