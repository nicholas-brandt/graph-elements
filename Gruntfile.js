"use strict";
const babel_plugins_for_node = ["babel-plugin-check-es2015-constants", "babel-plugin-transform-es2015-block-scoped-functions", "babel-plugin-transform-es2015-block-scoping", "babel-plugin-transform-es2015-computed-properties", "babel-plugin-transform-es2015-destructuring", "babel-plugin-transform-es2015-for-of", "babel-plugin-transform-es2015-function-name", "babel-plugin-transform-es2015-literals", "babel-plugin-transform-es2015-object-super", "babel-plugin-transform-es2015-parameters", "babel-plugin-transform-es2015-shorthand-properties", "babel-plugin-transform-es2015-sticky-regex", "babel-plugin-transform-es2015-template-literals", "babel-plugin-transform-es2015-typeof-symbol", "babel-plugin-transform-es2015-unicode-regex", "babel-plugin-transform-regenerator"];
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
    cssmin: {},
    mochacli: {
        options: {
            harmony: true
        }
    }
};
const elementsSrc = src + "/elements";
const elementsBuild = build + "/elements";
const appsSrc = src + "/apps";
const appsBuild = build + "/apps";
const testsSrc = src + "/tests";
const testsBuild = build + "/tests";
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
config.htmlmin.apps = {
    files: [{
        expand: true,
        cwd: appsSrc,
        dest: appsBuild,
        src: ["**/*.html"]
    }]
};
config.babel.apps = {
    options: {
        plugins: ["transform-es2015-modules-amd"]
    },
    files: [{
        expand: true,
        cwd: appsSrc,
        dest: appsBuild,
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
config.less.apps = {
    files: [{
        expand: true,
        cwd: appsSrc,
        src: ["**/*.less"],
        dest: appsBuild,
        ext: ".css"
    }]
};
config.cssmin.apps = {
    files: [{
        expand: true,
        cwd: appsBuild,
        dest: appsBuild,
        src: ["**/*.css"]
    }]
};
config.babel.transpile = {
    options: {
        plugins: babel_plugins_for_node.concat("transform-es2015-modules-commonjs")
    },
    files: [{
        expand: true,
        cwd: src + "/lib",
        dest: "node-transpiled/lib",
        src: ["**/*.js"]
    }]
};
config.babel.tests = {
    options: {
        plugins: babel_plugins_for_node
    },
    files: [{
        expand: true,
        cwd: testsSrc,
        dest: testsBuild,
        src: ["**/*.js"]
    }]
};
config.uglify.tests = {
    files: [{
        expand: true,
        cwd: testsBuild,
        dest: testsBuild,
        src: ["**/*.js"]
    }]
};
config.mochacli.graph = {
    src: "build/tests/*.js",
    options: {
        reporter: "json",
        save: "build/tests/report.json",
        quiet: false,
        force: true,
        harmony: true
    }
};
const modules = ["babel", "contrib-uglify", "vulcanize", "contrib-htmlmin", "contrib-less", "contrib-cssmin", "crisper", "contrib-watch", "mocha-cli"];
module.exports = grunt => {
    grunt.initConfig(config);
    for (let mod of modules) grunt.loadNpmTasks("grunt-" + mod);
    grunt.registerTask("default", ["watch"]);
    grunt.registerTask("run", ["less", "cssmin", "babel", "htmlmin", "mochacli"]);
    grunt.registerTask("apps", ["htmlmin", "babel", "less", "cssmin"].map(task => task + ":apps"));
    grunt.registerTask("elements", ["htmlmin", "babel", "less", "cssmin"].map(task => task + ":elements"));
    grunt.registerTask("library", ["babel:library"]);
    grunt.registerTask("test", ["babel:tests", "uglify:tests", "mochacli:graph"]);
};