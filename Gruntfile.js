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
        },
        
        watch: {
            scripts: {
                files: ["src/**/*.js", "spec/**/*.js"],
                tasks: ["exec:test"]
            }
        }

    });

    grunt.loadNpmTasks("grunt-babel");
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask("default", ["exec:test", "babel"]);
    grunt.registerTask("test", ["exec:test"]);

};