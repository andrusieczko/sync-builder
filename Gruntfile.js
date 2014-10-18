module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*!\n' + ' * <%= pkg.name %> v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n' + ' * <%= pkg.description %>\n' + ' * <%= pkg.url %>\n' + ' * \n' + ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' + ' * Released under <%= pkg.license %> license\n' + ' */\n'
      },
      build: {
        src: '<%= pkg.main %>.js',
        dest: 'lib/<%= pkg.name %>.min.js'
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          quiet: false
        },
        src: ['test/**/*.js']
      }
    },
    mochacov: {
      coverage: {
        options: {
          coveralls: {
            serviceName: 'travis-ci'
          }
        }
      },
      test: {
        options: {
          reporter: 'spec'
        }
      },
      options: {
        files: 'test/*.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha-cov');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('travis', ['mochacov:coverage']);
  grunt.registerTask('default', ['uglify', 'mochaTest']);
  grunt.registerTask('test', ['mochaTest', 'mochacov:test']);

};