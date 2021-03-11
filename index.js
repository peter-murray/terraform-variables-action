const core = require('@actions/core')
  , util = require('./src/util')
  ;

async function execute() {
  try {
    await run();
  } catch(err) {
    core.setFailed(err.message);
  }
}
execute();

async function run() {
  const directory = getRequiredInput('outputDir')
  , name = getRequiredInput('name')
  , isAuto = getRequiredInputBoolean('auto')
  , content = getRequiredInput('content')
  , overwrite = getRequiredInputBoolean('overwrite')
  ;

  // Defaulting to JSON for now
  const varsFileName = util.generateTfvarsFilename(name, true, isAuto);
  const file = await util.saveFile(directory, varsFileName, content, overwrite);

  console.log(`Generated tfvars file at ${file}`);
  core.setOutput('tfvars_file', file);
}

function getRequiredInput(name) {
  return core.getInput(name, {required: true});
}

function getRequiredInputBoolean(name) {
  const value = getRequiredInput(name);
  return value.toLowerCase() == 'true';
}