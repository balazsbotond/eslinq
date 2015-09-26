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
                command: "npm publish"
            }
        },

        watch: {
            scripts: {
                files: ["src/**/*.js", "spec/**/*.js"],
                tasks: ["exec:test"]
            }
        },
        
        copy: {
            main: {
                files: [
                    { expand: true, cwd: "out/src", src: ["**/*.js"], dest: "dist" }
                ]
            }
        }

    });

    grunt.loadNpmTasks("grunt-babel");
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask("default", ["exec:test", "babel", "copy"]);
    grunt.registerTask("test", ["exec:test"]);
    grunt.registerTask("publish", ["default", "exec:publish"]);

};