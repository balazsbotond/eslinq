module.exports = function(grunt) {

    grunt.initConfig({
        "babel": {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "dist/from.js": "from.js"
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-babel");

    grunt.registerTask("default", ["babel"]);

};