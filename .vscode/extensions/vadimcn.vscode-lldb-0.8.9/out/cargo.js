"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const util_1 = require("util");
const util = require("./util");
const extension_1 = require("./extension");
function getProgramFromCargo(cargoConfig, cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        let cargoArgs = cargoConfig.args;
        let pos = cargoArgs.indexOf('--');
        // Insert either before `--` or at the end.
        cargoArgs.splice(pos >= 0 ? pos : cargoArgs.length, 0, '--message-format=json');
        extension_1.output.appendLine('Running `cargo ' + cargoArgs.join(' ') + '`...');
        let artifacts = yield getCargoArtifacts(cargoArgs, cwd);
        if (artifacts.length == 0) {
            extension_1.output.show();
            vscode_1.window.showErrorMessage('Cargo has produced no binary artifacts.', { modal: true });
            throw new Error('Cannot start debugging.');
        }
        if (cargoConfig.filter != undefined) {
            let filter = cargoConfig.filter;
            artifacts = artifacts.filter(a => {
                if (filter.name != undefined && a.name != filter.name)
                    return false;
                if (filter.kind != undefined && a.kind != filter.kind)
                    return false;
                return true;
            });
        }
        extension_1.output.appendLine('Matching compilation artifacts: ');
        for (var artifact of artifacts) {
            extension_1.output.appendLine(util_1.inspect(artifact));
        }
        if (artifacts.length > 1) {
            extension_1.output.show();
            vscode_1.window.showErrorMessage('Cargo has produced more than one binary artifact.', { modal: true });
            throw new Error('Cannot start debugging.');
        }
        return artifacts[0].fileName;
    });
}
exports.getProgramFromCargo = getProgramFromCargo;
// Runs cargo, returns a list of compilation artifacts.
function getCargoArtifacts(cargoArgs, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        var artifacts = [];
        let exitCode = yield runCargo(cargoArgs, folder, message => {
            if (message.reason == 'compiler-artifact') {
                let isBinary = message.target.crate_types.includes('bin');
                let isBuildScript = message.target.kind.includes('custom-build');
                if ((isBinary && !isBuildScript) || message.profile.test) {
                    for (var i = 0; i < message.filenames.length; ++i) {
                        if (message.filenames[i].endsWith('.dSYM'))
                            continue;
                        artifacts.push({
                            fileName: message.filenames[i],
                            name: message.target.name,
                            kind: message.target.kind[i]
                        });
                    }
                }
            }
            else if (message.reason == 'compiler-message') {
                extension_1.output.appendLine(message.message.rendered);
            }
        }, stderr => { extension_1.output.append(stderr); });
        if (exitCode != 0) {
            extension_1.output.show();
            throw new Error('Cargo invocation has failed (exit code: ' + exitCode.toString() + ').');
        }
        return artifacts;
    });
}
function getLaunchConfigs(folder) {
    return __awaiter(this, void 0, void 0, function* () {
        let configs = [];
        if (fs.existsSync(path.join(folder, 'Cargo.toml'))) {
            var metadata = null;
            let exitCode = yield runCargo(['metadata', '--no-deps', '--format-version=1'], folder, m => { metadata = m; }, stderr => { extension_1.output.append(stderr); });
            if (metadata && exitCode == 0) {
                for (var pkg of metadata.packages) {
                    for (var target of pkg.targets) {
                        let target_kinds = target.kind;
                        var debug_selector = null;
                        var test_selector = null;
                        if (target_kinds.includes('bin')) {
                            debug_selector = ['--bin=' + target.name];
                            test_selector = ['--bin=' + target.name];
                        }
                        if (target_kinds.includes('test')) {
                            debug_selector = ['--test=' + target.name];
                            test_selector = ['--test=' + target.name];
                        }
                        if (target_kinds.includes('lib')) {
                            test_selector = ['--lib'];
                        }
                        if (debug_selector) {
                            configs.push({
                                type: 'lldb',
                                request: 'launch',
                                name: 'Debug ' + target.name,
                                cargo: { args: ['build'].concat(debug_selector) },
                                args: [],
                                cwd: '${workspaceFolder}'
                            });
                        }
                        if (test_selector) {
                            configs.push({
                                type: 'lldb',
                                request: 'launch',
                                name: 'Debug tests in ' + target.name,
                                cargo: { args: ['test', '--no-run'].concat(test_selector) },
                                args: [],
                                cwd: '${workspaceFolder}'
                            });
                        }
                    }
                }
            }
        }
        return configs;
    });
}
exports.getLaunchConfigs = getLaunchConfigs;
// Runs cargo, invokes stdout/stderr callbacks as data comes in, returns the exit code.
function runCargo(cargoArgs, cwd, onStdoutJson, onStderrString) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let cargo = cp.spawn('cargo', cargoArgs, {
                stdio: ['ignore', 'pipe', 'pipe'],
                cwd: cwd
            });
            cargo.on('error', err => reject(err));
            cargo.stderr.on('data', chunk => {
                onStderrString(chunk.toString());
            });
            var stdout = '';
            cargo.stdout.on('data', chunk => {
                stdout += chunk;
                let lines = stdout.split('\n');
                stdout = lines.pop();
                for (var line of lines) {
                    let message = JSON.parse(line);
                    onStdoutJson(message);
                }
            });
            cargo.on('exit', (exitCode, signal) => {
                resolve(exitCode);
            });
        });
    });
}
function expandCargo(launchConfig, cargoDict) {
    let expander = (type, key) => {
        if (type == 'cargo') {
            let value = cargoDict[key];
            if (value == undefined)
                throw new Error('cargo:' + key + ' is not defined');
            return value.toString();
        }
    };
    return util.expandVariablesInObject(launchConfig, expander);
}
exports.expandCargo = expandCargo;
//# sourceMappingURL=cargo.js.map