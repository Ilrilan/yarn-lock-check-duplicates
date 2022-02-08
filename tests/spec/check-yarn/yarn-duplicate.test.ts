import * as assert from 'assert';
import { exec } from 'child_process';
import { resolve } from 'path'

describe('Check script which search duplicates in yarn.lock files', function () {
    const bin = resolve(__dirname, '../../../bin/yarn-lock-check-duplicates.js');

	describe('Invalid case', () => {
		it('We check that duplicates will be found', function () {
			exec(`PATH_TO_FILE="/tests/spec/check-yarn/resource/yarn.lock" node ${bin} -s @babel`, { cwd: process.cwd() }, (err, stdout) => {
                assert.equal(err?.code, 1);
				assert.ok(stdout.includes('"name": "@babel/helper-define-polyfill-provider"'));
			});
		});
		it('We check that if the path to the file is incorrect, the error falls', function() {
			exec(`PATH_TO_FILE="/tests/spec/check-yarn/yarn.lock" node ${bin} -s @babel`, { cwd: process.cwd() }, (err, stdout, stderr) => {
				assert.equal(err?.code, 1);
				assert.ok(stderr.includes(`Can't find "yarn.lock" file`));
			});
		});
	
		it('We check without specifying the scope', function() {
			exec(`PATH_TO_FILE="/tests/spec/check-yarn/resource/yarn.lock" node ${bin}`, { cwd: process.cwd() }, (err, stdout, stderr) => {
				assert.equal(err?.code, 1);
				assert.ok(stderr.includes('Scope for search duplicates is not defined! Example: yarn-lock-check-duplicates -s @babel'))
			});
		});
	});

    describe('Valid case', () => {
		it('We check with the file without repetitions', function() {
			exec(`PATH_TO_FILE="/tests/spec/check-yarn/resource/valid.yarn.lock" node ${bin} -s @babel`, { cwd: process.cwd() }, (err, stdout, stderr) => {
                assert.equal(err?.code, null);
				assert.ok(stdout.includes('Packages installed from scope @babel has no duplicates'));
			});
		});
	});
});