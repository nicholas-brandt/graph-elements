tsc -p ./
cd resources
# clean
rm -r dist
mkdir dist
# compile less: 
npx less src/project.less dist/project.css
# bundle js: resources/src/project.js to resources/dist/project.js
npx webpack --config webpack.config.js --mode production
# npx babel src/project.js --out-file dist/project.packed.js --source-maps inline --verbose