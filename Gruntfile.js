module.exports = function(grunt) {

    grunt.initConfig({
        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "dist/src/eslinq.js": "src/eslinq.js"
                }
            }
        },
        exec: {
            test: {
                command: "node node_modules/jasmine-es6/bin/jasmine.js"
            }
        }
    });

    grunt.loadNpmTasks("grunt-babel");
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask("test", ["exec:test"]);
    grunt.registerTask("default", ["exec:test", "babel"]);

};