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
  , isAuto = getRequiredInput('auto')
  // , isJson = retRequiredInput('is_json')npm run build
  , content = getRequiredInput('content')
  , overwrite = getRequiredInput('overwrite').toLowerCase() == 'true'
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
