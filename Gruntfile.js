"use strict";
const src = "src";
const build = "build";
const staticElements = [];
const elements = [];
const HTML_PIPE = ["htmlmin"];
const JS_PIPE = ["babel", "uglify"];
const LESS_PIPE = ["less", "cssmin"];
const PIPE = HTML_PIPE.concat(JS_PIPE, LESS_PIPE);
const STATIC_PIPE = ["vulcanize", "crisper"].concat(HTML_PIPE, JS_PIPE);
const config = {
     watch: {
         options: {
             atBegin: true
         }
     },
    vulcanize: {
        options: {
            inlineScripts: true,
            inlineCss: true
        }
    },
    crisper: {
        options: {
            cleanup: false
        }
    },
    htmlmin: {
        options: {
            removeComments: true,
            useShortDoctype: true,
            customAttrAssign: [/\?=/g, /\$=/g],
            //@debug minifyJS: false,
            minifyJS: true,
            minifyCSS: false,
            collapseWhitespace: true
        }
    },
    babel: {
        options: {
            compact: false,
            comments: true,
            plugins: ["babel-preset-es2015"]
        }
    },
    uglify: {
        options: {
            //@debug beautify: true,
            beautify: false,
            compress: {
                sequences: false,
                properties: true,
                dead_code: true,
                drop_debugger: false,
                conditionals: true,
                comparisons: true,
                evaluate: true,
                booleans: true,
                loops: true,
                unused: true,
                hoist_funs: true,
                if_return: true,
                join_vars: true,
                cascade: true,
                negate_iife: true
            },
            mangle: false,
            screwIe8: true
        }
    },
    less: {
        options: {
            ieCompat: false,
            compress: false,
            optimization: 0
        }
    },
    cssmin: {}
};
for (let element of elements) {
    config.htmlmin[element] = {
        files: [{
            expand: true,
            cwd: src,
            dest: build,
            src: [`html/${element}.html`]
        }]
    };
    config.babel[element] = {
        files: [{
            expand: true,
            cwd: src,
            dest: build,
            src: [`scripts/${element}.js`]
        }]
    };
    config.uglify[element] = {
        files: [{
            expand: true,
            cwd: build,
            dest: build,
            src: [`scripts/${element}.js`]
        }]
    };
    config.less[element] = {
        files: {
            [`${build}/stylesheets/${element}.css`]: `${src}/stylesheets/${element}.less`
        }
    };
    config.cssmin[element] = {
        files: [{
            expand: true,
            cwd: build,
            dest: build,
            src: [`stylesheets/${element}.css`]
        }]
    };
    config.watch[element + "HTML"] = {
        files: [`${src}/html/${element}.html`],
        tasks: HTML_PIPE.map(part => part + ":" + element)
    };
    config.watch[element + "JS"] = {
        files: [`${src}/scripts/${element}.js`],
        tasks: JS_PIPE.map(part => part + ":" + element)
    };
    config.watch[element + "LESS"] = {
        files: [`${src}/stylesheets/${element}.less`],
        tasks: LESS_PIPE.map(part => part + ":" + element)
    };
}
for (let element of staticElements) {
    config.vulcanize[element] = {
        files: {
            [`${build}/html/${element}.html`]: `${src}/html/${element}.html`
        }
    };
    config.crisper[element] = {
        src: `${build}/html/${element}.html`,
        dest: `${build}/html/${element}.html`
    };
    config.htmlmin[element] = {
        files: [{
            expand: true,
            cwd: build,
            dest: build,
            src: [`html/${element}.html`]
        }]
    };
    config.babel[element] = {
        files: [{
            expand: true,
            cwd: build,
            dest: build,
            src: [`html/${element}.js`]
        }]
    };
    config.uglify[element] = {
        files: [{
            expand: true,
            cwd: build,
            dest: build,
            src: [`html/${element}.js`]
        }]
    };
    config.watch[element] = {
        files: [`${src}/html/${element}.html`],
        tasks: STATIC_PIPE.map(part => part + ":" + element)
    };
}
const modules = ["babel", "contrib-uglify", "vulcanize", "contrib-htmlmin", "contrib-less", "contrib-cssmin", "crisper", "contrib-watch"];
module.exports = function(grunt) {
    grunt.initConfig(config);
    for (let mod of modules) grunt.loadNpmTasks("grunt-" + mod);
    grunt.registerTask("default", ["watch"]);
    grunt.registerTask("run", ["less", "cssmin", "babel:avatec-template", "vulcanize", "crisper", "htmlmin", "babel", "uglify"]);
    const element_task = [];
    for (let element of elements) {
        const pipe = PIPE.map(part => part + ":" + element);
        element_task.push(...pipe);
    }
    grunt.registerTask("elements", element_task);
    const static_element_task = [];
    for (let element of staticElements) {
        const pipe = STATIC_PIPE.map(part => part + ":" + element);
        grunt.registerTask("static-elements", pipe);
        static_element_task.push(...pipe);
    }
    grunt.registerTask("static-elements", static_element_task);
};