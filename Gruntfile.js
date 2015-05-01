module.exports = function(grunt) {
    grunt.initConfig({
        babel: {
            options: {
                experimental: true,
                compact: false,
                comments: true
            },
            scripts: {
                options: {
                    modules: "amd"
                },
                files: [{
                    expand: true,
                    cwd: "src/",
                    dest: "build/",
                    src: ["**/*.js", "!tests/spec/**/*.js"]
                }]
            },
            tests: {
                files: [{
                    expand: true,
                    cwd: "src/",
                    dest: "build/",
                    src: ["tests/spec/**/*.js"]
                }]
            }
        },
        uglify: {
            minify: {
                options: {
                    beautify: false,
                    compress: {
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
                        negate_iife: true
                    },
                    mangle: true
                },
                files: [{
                    expand: true,
                    cwd: "build/",
                    dest: "build/",
                    ext: ".min.js",
                    extDot: "last",
                    src: ["**/*.js", "!**/*.min.js"]
                }]
            },
            beautify: {
                options: {
                    beautify: {
                        beautify: true,
                        width: 200,
                        space_colon: false
                    },
                    compress: false,
                    screw_ie8: true,
                    mangle: false
                },
                files: [{
                    expand: true,
                    cwd: "build/",
                    dest: "build/",
                    src: ["**/*.js", "!**/*.min.js"]
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
                    useShortDoctype: true,
                    customAttrAssign: [/\?=/g],
                    minifyJS: true,
                    minifyCSS: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    cwd: "build/",
                    dest: "build/",
                    ext: ".min.html",
                    extDot: "last",
                    src: ["**/*.html", "!**/*.min.html"]
                }]
            }
        },
        vulcanize: {
            polymer: {
                options: {
                    inline: true,
                    strip: true
                },
                files: {
                    "build/external/vulcanized.html": "build/external/polymer.html"
                }
            }
        },
        copy: {
            appcache: {
                files: [{
                    expand: true,
                    cwd: "src/",
                    dest: "build/",
                    src: ["**/*.appcache"]
                }]
            },
            html: {
                files: [{
                    expand: true,
                    cwd: "src/",
                    dest: "build/",
                    src: ["**/*.html"]
                }]
            }
        },
        jsdoc: {
            options: {
                destination: "doc"
            },
            doc: {
                src: "src/"
            }
        },
        jasmine_nodejs: {
            options: {
                specNameSuffix: ".min.js",
                reporters: {
                    junit: {
                        savePath: "build/tests/report/"
                    }
                }
            },
            test: {
                specs: ["build/tests/spec/**"]
            }
        },
        watch: {
            options: {
                atBegin: true
            },
            transpileScripts: {
                files: ["src/**/*.js"],
                tasks: ["babel"]
            },
            minifyScripts: {
                files: ["build/**/*.js", "!build/**/*.min.js"],
                tasks: ["uglify:minify"]
            },
            beautifyScripts: {
                files: ["build/**/*.js", "!build/**/*.min.js"],
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
            copyHTML: {
                files: ["src/**/*.html"],
                tasks: ["copy"]
            },
            minifyHTML: {
                files: ["build/**/*.html"],
                tasks: ["htmlmin:minify"]
            },
            vulcanizePolymer: {
                files: ["build/external/polymer.html"],
                tasks: ["vulcanize:polymer"]
            },
            copyAppcache: {
                files: ["src/**/*.appcache"],
                tasks: ["copy"]
            },
            test: {
                files: ["build/**/*.js"],
                tasks: ["jasmine_nodejs"]
            }
        }
    });
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-babel");
    grunt.loadNpmTasks("grunt-vulcanize");
    grunt.loadNpmTasks("grunt-contrib-htmlmin");
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-jasmine-nodejs');
    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.registerTask("default", ["watch"]);
    grunt.registerTask("run", ["copy", "babel", "uglify", "less", "cssmin", "vulcanize", "htmlmin", "jasmine_nodejs"]);
};