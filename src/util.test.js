const path = require('path')
, fs = require('fs')
, expect = require('chai').expect
, io = require('@actions/io')
, util = require('./util')
;

describe('util', () => {

  describe('generateTfvarsFilename()', () => {

    it('should generate generic tfvars', () => {
      const result = util.generateTfvarsFilename();
      expect(result).to.equal('terraform.tfvars');
    });

    it('should generate a named tfvars', () => {
      const result = util.generateTfvarsFilename('my-vars');
      expect(result).to.equal('my-vars.tfvars');
    });

    it('should generate a generic json tfvars', () => {
      const expectedResult = 'terraform.tfvars.json';

      expect(util.generateTfvarsFilename(undefined, true)).to.equal(expectedResult);
      expect(util.generateTfvarsFilename(null, true)).to.equal(expectedResult);
      expect(util.generateTfvarsFilename('', true)).to.equal(expectedResult);
      expect(util.generateTfvarsFilename('  ', true)).to.equal(expectedResult);
    });

    it('should generate a generic json auto tfvars', () => {
      const expectedResult = 'terraform.auto.tfvars.json';

      expect(util.generateTfvarsFilename(undefined, true, true)).to.equal(expectedResult);
      expect(util.generateTfvarsFilename(null, true, true)).to.equal(expectedResult);
      expect(util.generateTfvarsFilename('', true, true)).to.equal(expectedResult);
      expect(util.generateTfvarsFilename('  ', true, true)).to.equal(expectedResult);
    });
  });


  describe('saveFile', () => {

    let baseDir;

    before(async () => {
      const dir = path.join(__dirname, '..', '.test');
      await io.rmRF(dir);
      baseDir = await util.getOrCreateDirectory(dir);
    });

    after(async () => {
      if (baseDir) {
        await io.rmRF(baseDir);
      }
    });

    it('should save a file', async () => {
      const content = JSON.stringify({name: 'hello', version: '1.0.0'})
        , filename = 'terraform'
        ;

      const createdFile = await util.saveFile(baseDir, filename, content);
      expect(createdFile).to.equal(path.join(baseDir, `${filename}`));

      const createdFileContent = fs.readFileSync(createdFile).toString('utf8');
      expect(createdFileContent).to.equal(content);
    });

    it('should error and fail to overwrite if not allowed', async () => {
      const content = JSON.stringify({name: 'hello', version: '1.0.0'})
        , filename = 'no_overwrite.json'
        ;

      const createdFile = await util.saveFile(baseDir, filename, content);
      expect(createdFile).to.equal(path.join(baseDir, `${filename}`));

      compareFileContent(createdFile, content);

      // Try to overwite it without allowing overwrite
      try {
        await util.saveFile(baseDir, filename, 'hello');
      } catch (err) {
        expect(err.message).to.contain('overwrite');
      }

      compareFileContent(createdFile, content);
    });

    it('should overwrite existing file if specified', async() => {
      const content = JSON.stringify({name: 'hello', version: '1.0.0'})
      , filename = 'overwrite.json'
      ;

      const createdFile = await util.saveFile(baseDir, filename, content);
      expect(createdFile).to.equal(path.join(baseDir, `${filename}`));

      compareFileContent(createdFile, content);

      const replacedContent = JSON.stringify({a: 'a', b: 1});
      await util.saveFile(baseDir, filename, replacedContent, true);
      compareFileContent(createdFile, replacedContent);
    });
  });
});


function compareFileContent(file, expected) {
  const content = fs.readFileSync(file).toString('utf8');
  expect(content).to.equal(expected);
}