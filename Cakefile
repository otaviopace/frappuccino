{ spawn } = require 'child_process'

tasks =
  build:
    name: 'build'
    description: 'Build project from src/*.coffee to lib/*.js'
    command: 'coffee'
    args: ['--compile', '--output', 'lib/', 'src/']
  test:
    name: 'test'
    description: 'Run test files on /tests folder'
    command: 'jest'
    args: []
  lint:
    name: 'lint'
    description: 'Run linter of src and tests folder'
    command: 'coffeelint'
    args: ['src', 'tests']

beautifyCommand = (command) ->
  '\n> ' + command

printDescriptionAndCommand = (taskObj) ->
  console.log taskObj.description
  fullCommand = taskObj.command + ' ' + taskObj.args.join(' ')
  console.log beautifyCommand fullCommand

setupTasks = (taskObj) ->
  task taskObj.name, taskObj.description, ->
    printDescriptionAndCommand taskObj
    subProcess = spawn taskObj.command, taskObj.args, stdio: 'inherit'
    subProcess.on 'exit', process.exit

setupTasks obj for name, obj of tasks
