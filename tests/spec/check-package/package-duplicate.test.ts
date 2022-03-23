import * as assert from 'assert';
import { exec } from 'child_process';
import { resolve } from 'path';

describe('Check script which search duplicates in package-lock files', function () {
	const bin = resolve(__dirname, '../../../bin/index.js');

	describe('Invalid case', () => {
		it('We check that duplicates will be found', function () {
			exec(`PATH_TO_FILE="/tests/spec/check-package/resource/package-lock.json" ${bin} -s @tinkoff-codeceptjs -t package`, { cwd: process.cwd() }, (err, stdout) => {
				assert.equal(err?.code, 1);
				assert.ok(stdout.includes('"name": "@tinkoff-codeceptjs/base-helper"'));
				assert.ok(stdout.includes('"name": "@tinkoff-codeceptjs/utils"'));
			});
		});
		it('We check that if the path to the file is incorrect, the error falls', function() {
			exec(`PATH_TO_FILE="/tests/spec/check-package/package-lock.json" ${bin} -s @tinkoff-codeceptjs -t package`, { cwd: process.cwd() }, (err, stdout, stderr) => {
				assert.equal(err?.code, 1);
				assert.ok(stderr.includes(`Can't find "package-lock.json" file`));
			});
		});
	
		it('We check without specifying the scope', function() {
			exec(`PATH_TO_FILE="/tests/spec/check-package/resource/package-lock.json" ${bin}`, { cwd: process.cwd() }, (err, stdout, stderr) => {
				assert.equal(err?.code, 1);
				assert.ok(stderr.includes('Scope for search duplicates is not defined! Example: check-duplicates -s @babel'))
			});
		});

		it('We check without specifying the target', function() {
			exec(`PATH_TO_FILE="/tests/spec/check-package/resource/package-lock.json" ${bin} -s @babel`, { cwd: process.cwd() }, (err, stdout, stderr) => {
				assert.equal(err?.code, 1);
				assert.ok(stderr.includes('The target file for searching for duplicates is not defined! Example: check-duplicates -t package'))
			});
		});

		it('We check with an invalid target', function() {
			exec(`PATH_TO_FILE="/tests/spec/check-package/resource/package-lock.json" ${bin} -s @babel -t test`, { cwd: process.cwd() }, (err, stdout, stderr) => {
				assert.equal(err?.code, 1);
				assert.ok(stderr.includes('The target file can only be of two types - package or yarn! "test" is not allowed'))
			});
		});
	});
	
	describe('Valid case', () => {
		it('We check with the file without repetitions', function() {
			exec(`PATH_TO_FILE="/tests/spec/check-package/resource/valid-package-lock.json" ${bin} -s @tinkoff-codeceptjs -t package`, { cwd: process.cwd() }, (err, stdout, stderr) => {
				assert.equal(err?.code, null);
				assert.ok(stdout.includes('Packages installed from scope @tinkoff-codeceptjs has no duplicates'));
			});
		});
	});
});