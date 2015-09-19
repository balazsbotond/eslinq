module.exports = function(grunt) {

    grunt.initConfig({
        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "dist/src/from.js": "src/from.js"//,
                    //"dist/test/from.js": "test/from.js"
                }
            }
        }//,
        // jasmine : {
        //     src: 'dist/src/**/*.js',
        //     options : {
        //         specs : 'dist/test/**/*.js'
        //     }
        // },
    });

    grunt.loadNpmTasks("grunt-babel");
//    grunt.loadNpmTasks("grunt-contrib-jasmine");

    grunt.registerTask("default", ["babel", /*"jasmine"*/]);

};