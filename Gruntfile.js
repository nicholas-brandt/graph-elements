module.exports = function(grunt) {
    /* String.prototype.endsWith polyfill */
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(searchString, position) {
            var subjectString = this.toString();
            if (position === undefined || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
    }
    grunt.initConfig({
        babel: {
            options: {
                experimental: true,
                compact: false
            },
            scripts: {
                files: [{
                    expand: true,
                    cwd: "src/",
                    dest: "build/",
                    ext: ".c.js",
                    extDot: "last",
                    src: ["**/*.js", "!**/*.m.js"]
                }]
            },
            modules: {
                options: {
                    modules: "system"
                },
                files: [{
                    expand: true,
                    cwd: "src/",
                    dest: "build/",
                    ext: ".c.js",
                    extDot: "last",
                    src: ["**/*.m.js"]
                }]
            }
        },
        uglify: {
            minify: {
                options: {
                    beautify: false,
                    sequences: true,
                    properties: true,
                    dead_code: true,
                    drop_debugger: true,
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
                    negate_iife: true,
                    mangle: false
                },
                files: [{
                    expand: true,
                    cwd: "build/",
                    dest: "build/",
                    ext: ".min.js",
                    extDot: "last",
                    src: ["**/*.c.js"]
                }]
            },
            beautify: {
                options: {
                    beautify: true,
                    width: 200
                },
                files: [{
                    expand: true,
                    cwd: "build/",
                    dest: "build/",
                    src: ["**/*.c.js"]
                }]
            }
        },
        less: {
            compile: {
                options: {
                    ieCompat: false
                },
                files: [{
                    expand: true,
                    cwd: "src/",
                    dest: "build/",
                    ext: ".css",
                    extDot: "last",
                    src: ["**/*.less"]
                }]
            }
        },
        cssmin: {
            minify: {
                files: [{
                    expand: true,
                    cwd: "build/",
                    dest: "build/",
                    ext: ".min.css",
                    extDot: "last",
                    src: ["**/*.css", "!**/*.min.css"]
                }]
            }
        },
        htmlmin: {
            minify: {
                options: {
                    removeComments: true,
                    useShortDoctype: true
                },
                files: [{
                    expand: true,
                    cwd: "src/",
                    dest: "build/",
                    ext: ".min.html",
                    extDot: "last",
                    src: ["**/*.html"]
                }]
            }
        },
        watch: {
            options: {
                atBegin: true
            },
            compileScripts: {
                files: ["src/**/*.js", "!src/**/*.m.js"],
                tasks: ["babel:scripts"]
            },
            compileModules: {
                files: ["src/**/*.m.js"],
                tasks: ["babel:modules"]
            },
            minifyScripts: {
                files: ["build/**/*.c.js"],
                tasks: ["uglify:minify"]
            },
            beautifyScripts: {
                files: ["build/**/*.c.js"],
                tasks: ["uglify:beautify"]
            },
            compileLESS: {
                files: ["src/**/*.less"],
                tasks: ["less:compile"]
            },
            minifyCSS: {
                files: ["build/**/*.css", "!build/**/*.min.css"],
                tasks: ["cssmin:minify"]
            },
            minifyHTML: {
                files: ["src/**/*.html"],
                tasks: ["htmlmin:minify"]
            }
        }
    });
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-babel");
    grunt.loadNpmTasks("grunt-contrib-htmlmin");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.registerTask("default", ["watch"]);
};