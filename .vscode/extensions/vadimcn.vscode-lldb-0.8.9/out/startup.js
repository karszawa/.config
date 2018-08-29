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
const util_1 = require("util");
const cp = require("child_process");
const path = require("path");
const ver = require("./ver");
const util = require("./util");
const extension_1 = require("./extension");
class AdapterProcess {
    constructor(process) {
        this.process = process;
        this.isAlive = true;
        process.on('exit', (code, signal) => {
            this.isAlive = false;
            if (signal) {
                extension_1.output.appendLine(util_1.format('Adapter terminated by %s signal.', signal));
            }
            if (code) {
                extension_1.output.appendLine(util_1.format('Adapter exit code: %d.', code));
            }
        });
    }
    terminate() {
        if (this.isAlive) {
            this.process.kill();
        }
    }
}
exports.AdapterProcess = AdapterProcess;
// Start debug adapter in TCP session mode and return the port number it is listening on.
function startDebugAdapter(context, folder, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = vscode_1.workspace.getConfiguration('lldb', folder ? folder.uri : undefined);
        let adapterPath = path.join(context.extensionPath, 'adapter');
        let paramsBase64 = getAdapterParameters(config, params);
        let lldbPath = config.get('executable', 'lldb');
        let lldbEnv = config.get('executable_env', {});
        let args = ['-b',
            '-O', util_1.format('command script import \'%s\'', adapterPath),
            '-O', util_1.format('script adapter.main.run_tcp_session(0, \'%s\')', paramsBase64)
        ];
        let lldb = spawnDebugger(args, config.get('executable', 'lldb'), lldbEnv);
        let regex = new RegExp('^Listening on port (\\d+)\\s', 'm');
        let match = yield waitPattern(lldb, regex);
        let adapter = new AdapterProcess(lldb);
        adapter.port = parseInt(match[1]);
        return adapter;
    });
}
exports.startDebugAdapter = startDebugAdapter;
function launchDebugServer(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = vscode_1.workspace.getConfiguration('lldb', null);
        let adapterPath = path.join(context.extensionPath, 'adapter');
        let paramsBase64 = getAdapterParameters(config, {});
        let lldbPath = config.get('executable', 'lldb');
        let command = util_1.format('%s -b -O "command script import \'%s\'" ', lldbPath, adapterPath) +
            util_1.format('-O "script adapter.main.run_tcp_server()"\n');
        let terminal = vscode_1.window.createTerminal('LLDB Debug Server');
        terminal.sendText(command);
        terminal.show(true);
    });
}
exports.launchDebugServer = launchDebugServer;
function setIfDefined(target, config, key) {
    let value = util.getConfigNoDefault(config, key);
    if (value !== undefined)
        target[key] = value;
}
function getAdapterParameters(config, params) {
    setIfDefined(params, config, 'logLevel');
    setIfDefined(params, config, 'loggers');
    setIfDefined(params, config, 'logFile');
    setIfDefined(params, config, 'reverseDebugging');
    setIfDefined(params, config, 'suppressMissingSourceFiles');
    setIfDefined(params, config, 'evaluationTimeout');
    setIfDefined(params, config, 'ptvsd');
    return new Buffer(JSON.stringify(params)).toString('base64');
}
var DiagnosticsStatus;
(function (DiagnosticsStatus) {
    DiagnosticsStatus[DiagnosticsStatus["Succeeded"] = 0] = "Succeeded";
    DiagnosticsStatus[DiagnosticsStatus["Warning"] = 1] = "Warning";
    DiagnosticsStatus[DiagnosticsStatus["Failed"] = 2] = "Failed";
    DiagnosticsStatus[DiagnosticsStatus["NotFound"] = 3] = "NotFound";
})(DiagnosticsStatus || (DiagnosticsStatus = {}));
function diagnose() {
    return __awaiter(this, void 0, void 0, function* () {
        extension_1.output.clear();
        var status = DiagnosticsStatus.Succeeded;
        try {
            extension_1.output.appendLine('--- Checking version ---');
            var versionPattern = '^lldb version ([0-9.]+)';
            var desiredVersion = '3.9.1';
            if (process.platform.includes('win32')) {
                desiredVersion = '4.0.0';
            }
            else if (process.platform.includes('darwin')) {
                versionPattern = '^lldb-([0-9.]+)';
                desiredVersion = '360.1.68';
            }
            let pattern = new RegExp(versionPattern, 'm');
            let config = vscode_1.workspace.getConfiguration('lldb', null);
            let lldbPathOrginal = config.get('executable', 'lldb');
            let lldbPath = lldbPathOrginal;
            let lldbEnv = config.get('executable_env', {});
            // Try to locate LLDB and get its version.
            var version = null;
            var lldbNames;
            if (process.platform.includes('linux')) {
                // Linux tends to have versioned binaries only.
                lldbNames = ['lldb', 'lldb-10.0', 'lldb-9.0', 'lldb-8.0', 'lldb-7.0',
                    'lldb-6.0', 'lldb-5.0', 'lldb-4.0', 'lldb-3.9'];
            }
            else {
                lldbNames = ['lldb'];
            }
            if (lldbPathOrginal != 'lldb') {
                lldbNames.unshift(lldbPathOrginal); // Also try the explicitly configured value.
            }
            for (var name of lldbNames) {
                try {
                    let lldb = spawnDebugger(['-v'], name, lldbEnv);
                    version = (yield waitPattern(lldb, pattern))[1];
                    lldbPath = name;
                    break;
                }
                catch (err) {
                    extension_1.output.appendLine(util_1.inspect(err));
                }
            }
            if (!version) {
                status = DiagnosticsStatus.NotFound;
            }
            else {
                if (ver.lt(version, desiredVersion)) {
                    extension_1.output.appendLine(util_1.format('Warning: The version of your LLDB was detected as %s, which had never been tested with this extension. ' +
                        'Please consider upgrading to least version %s.', version, desiredVersion));
                    status = DiagnosticsStatus.Warning;
                }
                // Check if Python scripting is usable.
                extension_1.output.appendLine('--- Checking Python ---');
                let lldb2 = spawnDebugger(['-b',
                    '-O', 'script import sys, io, lldb',
                    '-O', 'script print(lldb.SBDebugger.Create().IsValid())',
                    '-O', 'script print("OK")'
                ], lldbPath, lldbEnv);
                // [^] = match any char, including newline
                let match2 = yield waitPattern(lldb2, new RegExp('^True$[^]*^OK$', 'm'));
            }
            extension_1.output.appendLine('--- Done ---');
            extension_1.output.show(true);
            // If we updated lldbPath, ask user what to do.
            if (lldbPathOrginal != lldbPath) {
                let action = yield vscode_1.window.showInformationMessage(util_1.format('Could not launch LLDB executable "%s", ' +
                    'however we did locate a usable LLDB binary: "%s". ' +
                    'Would you like to update LLDB configuration with this value?', lldbPathOrginal, lldbPath), 'Yes', 'No');
                if (action == 'Yes') {
                    extension_1.output.appendLine('Setting "lldb.executable": "' + lldbPath + '".');
                    config.update('executable', lldbPath, vscode_1.ConfigurationTarget.Global);
                }
                else {
                    status = DiagnosticsStatus.Failed;
                }
            }
        }
        catch (err) {
            extension_1.output.appendLine('');
            extension_1.output.appendLine('*** An exception was raised during self-test ***');
            extension_1.output.appendLine(util_1.inspect(err));
            status = DiagnosticsStatus.Failed;
        }
        extension_1.output.show(true);
        switch (status) {
            case DiagnosticsStatus.Succeeded:
                vscode_1.window.showInformationMessage('LLDB self-test completed successfuly.');
                break;
            case DiagnosticsStatus.Warning:
                vscode_1.window.showWarningMessage('LLDB self-test completed with warnings.  Please check LLDB output panel for details.');
                break;
            case DiagnosticsStatus.Failed:
                vscode_1.window.showErrorMessage('LLDB self-test has failed!');
                break;
            case DiagnosticsStatus.NotFound:
                let action = yield vscode_1.window.showErrorMessage('Could not find LLDB on your system.', 'Show installation instructions');
                if (action != null)
                    vscode_1.commands.executeCommand('vscode.open', vscode_1.Uri.parse('https://github.com/vadimcn/vscode-lldb/wiki/Installing-LLDB'));
                break;
        }
        return status < DiagnosticsStatus.Failed;
    });
}
exports.diagnose = diagnose;
// Spawn LLDB with the specified arguments, wait for it to output something matching
// regex pattern, or until the timeout expires.
function spawnDebugger(args, lldbPath, lldbEnv) {
    let env = Object.assign({}, process.env);
    for (var key in lldbEnv) {
        env[key] = util.expandVariables(lldbEnv[key], (type, key) => {
            if (type == 'env')
                return process.env[key];
            throw new Error('Unknown variable type ' + type);
        });
    }
    let options = {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: env,
        cwd: vscode_1.workspace.rootPath
    };
    if (process.platform.includes('darwin')) {
        // Make sure LLDB finds system Python before Brew Python
        // https://github.com/Homebrew/legacy-homebrew/issues/47201
        options.env['PATH'] = '/usr/bin:' + process.env['PATH'];
    }
    return cp.spawn(lldbPath, args, options);
}
function waitPattern(lldb, pattern, timeout_millis = 5000) {
    return new Promise((resolve, reject) => {
        var promisePending = true;
        var adapterOutput = '';
        // Wait for expected pattern in stdout.
        lldb.stdout.on('data', (chunk) => {
            let chunkStr = chunk.toString();
            extension_1.output.append(chunkStr); // Send to "LLDB" output pane.
            if (promisePending) {
                adapterOutput += chunkStr;
                let match = pattern.exec(adapterOutput);
                if (match) {
                    clearTimeout(timer);
                    adapterOutput = null;
                    promisePending = false;
                    resolve(match);
                }
            }
        });
        // Send sdterr to the output pane as well.
        lldb.stderr.on('data', (chunk) => {
            let chunkStr = chunk.toString();
            extension_1.output.append(chunkStr);
        });
        // On spawn error.
        lldb.on('error', (err) => {
            promisePending = false;
            reject(err);
        });
        // Bail if LLDB does not start within the specified timeout.
        let timer = setTimeout(() => {
            if (promisePending) {
                lldb.kill();
                let err = Error('The debugger did not start within the allotted time.');
                err.code = 'Timeout';
                err.stdout = adapterOutput;
                promisePending = false;
                reject(err);
            }
        }, timeout_millis);
        // Premature exit.
        lldb.on('exit', (code, signal) => {
            if (promisePending) {
                let err = Error('The debugger exited without completing startup handshake.');
                err.code = 'Handshake';
                err.stdout = adapterOutput;
                promisePending = false;
                reject(err);
            }
        });
    });
}
function analyzeStartupError(err) {
    return __awaiter(this, void 0, void 0, function* () {
        extension_1.output.appendLine(err.toString());
        extension_1.output.show(true);
        let e = err;
        let diagnostics = 'Run diagnostics';
        var actionAsync;
        if (e.code == 'ENOENT') {
            actionAsync = vscode_1.window.showErrorMessage(util_1.format('Could not start debugging because executable \'%s\' was not found.', e.path), diagnostics);
        }
        else if (e.code == 'Timeout' || e.code == 'Handshake') {
            actionAsync = vscode_1.window.showErrorMessage(err.message, diagnostics);
        }
        else {
            actionAsync = vscode_1.window.showErrorMessage('Could not start debugging.', diagnostics);
        }
        if ((yield actionAsync) == diagnostics) {
            yield diagnose();
        }
    });
}
exports.analyzeStartupError = analyzeStartupError;
//# sourceMappingURL=startup.js.map