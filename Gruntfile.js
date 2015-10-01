module.exports = function(grunt) {

    grunt.initConfig({

        babel: {
            options: {
                sourceMap: true,
                optional: "runtime"
            },
            dist: {
                files: {
                    "out/src/eslinq.js": "src/eslinq.js"
                }
            }
        },

        exec: {
            test: {
                command: "node node_modules/jasmine-es6/bin/jasmine.js"
            },
            publish: {
                command: "npm publish --tag beta"
            }
        },

        watch: {
            scripts: {
                files: ["src/**/*.js", "spec/**/*.js"],
                tasks: ["test"]
            }
        },
        
        copy: {
            main: {
                files: [
                    { expand: true, cwd: "out/src", src: ["**/*.js"], dest: "dist" }
                ]
            }
        },
        
        eslint: {
            target: [
                "src/**/*.js",
                "spec/**/*.js"
            ]
        }

    });

    grunt.loadNpmTasks("grunt-babel");
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask("default", ["exec:test", "eslint", "babel", "copy"]);
    grunt.registerTask("test", ["exec:test", "eslint"]);
    grunt.registerTask("publish", ["default", "exec:publish"]);

};