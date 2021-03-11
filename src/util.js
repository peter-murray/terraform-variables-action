const fs = require('fs')
  , path = require('path')
  , io = require('@actions/io')
  ;

module.exports.generateTfvarsFilename = (name, isJson, isAuto) => {
  let filename
    , extension
    ;

  if (!name || name.trim().length === 0) {
    filename = 'terraform';
  } else {
    filename = name.trim();
  }

  if (!!isAuto) {
    extension = 'auto.tfvars';
  } else {
    extension = 'tfvars';
  }

  if (!! isJson) {
    extension = `${extension}.json`
  }

  return `${filename}.${extension}`;
}

module.exports.saveFile = async (directory, filename, content, overwrite) => {
  const dirPath = await getOrCreateDirectory(getStringValue('outputDir', directory));
  const validFilename = getStringValue('name', filename)
  
  const file = path.join(dirPath, validFilename);
  const fileStat = getFileStats(file);

  if (fileStat) {
    if (!overwrite) {
      throw new Error(`File at '${file}' already exists and overwrite is false`);
    }

    if (!fileStat.isFile()) {
      throw new Error(`Output file target already exists and is not a file; '${file}'`);
    }
  }

  fs.writeFileSync(file, `${content}`);
  return file;
}

async function getOrCreateDirectory(dir) {
  const dirPath = path.resolve(dir)
    , directoryStat = getFileStats(dirPath)
    ;

  if (!directoryStat) {
    await io.mkdirP(dirPath);
  } else if (!directoryStat.isDirectory()) {
    throw new Error(`The specified directory exists, but is not a directory; ${dirPath}`);
  }

  return dirPath;
}

function getFileStats(file) {
  try {
    return fs.statSync(file);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}
module.exports.getOrCreateDirectory = getOrCreateDirectory;


function getStringValue(name, value) {
  if (value === undefined || value === null) {
    throw new Error(`A value must be provided for ${name}`);
  }

  const strValue = `${value}`;
  if (strValue.trim().length === 0) {
    throw new Error(`A value must be more than zero non-whitespace characters for ${name}`);
  }

  return strValue;
}