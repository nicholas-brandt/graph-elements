"use strict";
const src = "src";
const build = "build";
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
            comments: true
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
const elementsSrc = src + "/elements";
const elementsBuild = build + "/elements";
config.htmlmin.elements = {
    files: [{
        expand: true,
        cwd: elementsSrc,
        dest: elementsBuild,
        src: ["**/*.html"]
    }]
};
config.babel.elements = {
    files: [{
        expand: true,
        cwd: elementsSrc,
        dest: elementsBuild,
        src: ["**/*.js"]
    }]
};
//config.uglify.elements = {
//    files: [{
//        expand: true,
//        cwd: elementsBuild,
//        dest: elementsBuild,
//        src: ["**/*.js"]
//    }]
//};
config.less.elements = {
    files: [{
        expand: true,
        cwd: elementsSrc,
        src: ["**/*.less"],
        dest: elementsBuild,
        ext: ".css"
    }]
};
config.cssmin.elements = {
    files: [{
        expand: true,
        cwd: elementsBuild,
        dest: elementsBuild,
        src: ["**/*.css"]
    }]
};
config.babel.library = {
    options: {
        plugins: ["transform-es2015-modules-amd"]
    },
    files: [{
        expand: true,
        cwd: src + "/lib",
        dest: build + "/lib",
        src: ["**/*.js"]
    }]
};
const modules = ["babel", "contrib-uglify", "vulcanize", "contrib-htmlmin", "contrib-less", "contrib-cssmin", "crisper", "contrib-watch"];
module.exports = function(grunt) {
    grunt.initConfig(config);
    for (let mod of modules) grunt.loadNpmTasks("grunt-" + mod);
    grunt.registerTask("default", ["watch"]);
    grunt.registerTask("run", ["less", "cssmin", "babel", "htmlmin"]);
    grunt.registerTask("elements", ["htmlmin", "babel", /*"uglify",*/ "less", "cssmin"].map(task => task + ":elements"));
    grunt.registerTask("library", ["babel:library"]);
};