tsc -p ./
cd resources
# clean
rm -r dist
mkdir dist
# compile less: 
npx less src/project.less dist/project.css
# bundle js: resources/src/project.js to resources/dist/project.js
npx webpack --config webpack.config.js --mode production
# TODO: inject dist/project.css into src/project.inline.html and store as dist/project.html using parcel
npx parcel build src/project.inline.html --dist-dir dist --no-source-maps