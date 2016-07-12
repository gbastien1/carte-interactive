module.exports = function(grunt) {

  grunt.initConfig({

    // Project configuration
    pkg: grunt.file.readJSON('package.json'),

    // Compile Sass
    sass: {
      options: {
        sourceMap: true,
        sourceComments: false
      },
      dist: {
        files: [{
            expand: true,
            cwd: 'carte_interactive/static/carte_interactive/sass',
            src: ['**/*.scss'],
            dest: 'carte_interactive/static/carte_interactive/css',
            ext: '.css'
        }]
      }
    },

    // Watch and build
    watch: {
      sass: {
        files: 'carte_interactive/static/carte_interactive/sass/*.scss',
        tasks: ['sass']
      }
    }

  });

  // Load dependencies
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');

  // Run tasks
  grunt.registerTask('default', ['sass']);

};
