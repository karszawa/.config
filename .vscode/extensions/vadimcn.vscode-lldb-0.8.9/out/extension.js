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
const startup = require("./startup");
const util = require("./util");
const cargo = require("./cargo");
exports.output = vscode_1.window.createOutputChannel('LLDB');
class ActiveDebugSession {
    constructor(adapter, debugSession) {
        this.previewContent = {};
        this.adapter = adapter;
        this.debugSession = debugSession;
    }
}
class DisplaySettings {
    constructor() {
        this.showDisassembly = 'auto'; // 'always' | 'auto' | 'never'
        this.displayFormat = 'auto'; // 'auto' | 'hex' | 'decimal' | 'binary'
        this.dereferencePointers = true;
        this.containerSummary = true;
    }
}
;
function activate(context) {
    new Extension(context);
}
exports.activate = activate;
class Extension {
    constructor(context) {
        this.launching = [];
        this.activeSessions = {};
        this.previewContentChanged = new vscode_1.EventEmitter();
        this.context = context;
        let subscriptions = context.subscriptions;
        subscriptions.push(vscode_1.debug.registerDebugConfigurationProvider('lldb', this));
        subscriptions.push(vscode_1.debug.onDidStartDebugSession(this.onStartedDebugSession, this));
        subscriptions.push(vscode_1.debug.onDidTerminateDebugSession(this.onTerminatedDebugSession, this));
        subscriptions.push(vscode_1.debug.onDidReceiveDebugSessionCustomEvent(this.onDebugSessionCustomEvent, this));
        subscriptions.push(vscode_1.workspace.registerTextDocumentContentProvider('debugger', this));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.diagnose', startup.diagnose));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.pickProcess', () => this.pickProcess(false)));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.pickMyProcess', () => this.pickProcess(true)));
        subscriptions.push(vscode_1.commands.registerCommand('lldb.launchDebugServer', () => startup.launchDebugServer(this.context)));
        this.registerDisplaySettingCommand('lldb.showDisassembly', (settings) => __awaiter(this, void 0, void 0, function* () {
            settings.showDisassembly = yield vscode_1.window.showQuickPick(['always', 'auto', 'never']);
        }));
        this.registerDisplaySettingCommand('lldb.toggleDisassembly', (settings) => __awaiter(this, void 0, void 0, function* () {
            settings.showDisassembly = (settings.showDisassembly == 'auto') ? 'always' : 'auto';
        }));
        this.registerDisplaySettingCommand('lldb.displayFormat', (settings) => __awaiter(this, void 0, void 0, function* () {
            settings.displayFormat = yield vscode_1.window.showQuickPick(['auto', 'hex', 'decimal', 'binary']);
        }));
        this.registerDisplaySettingCommand('lldb.toggleDerefPointers', (settings) => __awaiter(this, void 0, void 0, function* () {
            settings.dereferencePointers = !settings.dereferencePointers;
        }));
        this.registerDisplaySettingCommand('lldb.toggleContainerSummary', (settings) => __awaiter(this, void 0, void 0, function* () {
            settings.containerSummary = !settings.containerSummary;
        }));
    }
    provideDebugConfigurations(folder, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let debugConfigs = yield cargo.getLaunchConfigs(folder ? folder.uri.fsPath : vscode_1.workspace.rootPath);
            if (debugConfigs.length == 0) {
                debugConfigs.push({
                    type: 'lldb',
                    request: 'launch',
                    name: 'Debug',
                    program: '${workspaceFolder}/<your program>',
                    args: [],
                    cwd: '${workspaceFolder}'
                });
            }
            return debugConfigs;
        });
    }
    // Invoked by VSCode to initiate a new debugging session.
    resolveDebugConfiguration(folder, launchConfig, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.context.globalState.get('lldb_works')) {
                vscode_1.window.showInformationMessage("Since this is the first time you are starting LLDB, I'm going to run some quick diagnostics...");
                let succeeded = yield startup.diagnose();
                this.context.globalState.update('lldb_works', succeeded);
                if (!succeeded) {
                    return null;
                }
            }
            exports.output.clear();
            let workspaceConfig = vscode_1.workspace.getConfiguration('lldb.launch', folder ? folder.uri : undefined);
            launchConfig = this.mergeWorkspaceSettings(launchConfig, workspaceConfig);
            let dbgconfigConfig = vscode_1.workspace.getConfiguration('lldb.dbgconfig', folder ? folder.uri : undefined);
            launchConfig = this.expandDbgConfig(launchConfig, dbgconfigConfig);
            // Transform "request":"custom" to "request":"launch" + "custom":true
            if (launchConfig.request == 'custom') {
                launchConfig.request = 'launch';
                launchConfig.custom = true;
            }
            // Deal with Cargo
            let cargoDict = {};
            if (launchConfig.cargo != undefined) {
                let cargoCwd = folder ? folder.uri.fsPath : vscode_1.workspace.rootPath;
                cargoDict.program = yield cargo.getProgramFromCargo(launchConfig.cargo, cargoCwd);
                delete launchConfig.cargo;
                // Expand ${cargo:program}.
                launchConfig = cargo.expandCargo(launchConfig, cargoDict);
                if (launchConfig.program == undefined) {
                    launchConfig.program = cargoDict.program;
                }
                // Add 'rust' to sourceLanguages, since this project obviously (ha!) involves Rust.
                if (!launchConfig.sourceLanguages)
                    launchConfig.sourceLanguages = [];
                launchConfig.sourceLanguages.push('rust');
            }
            let adapterParams = {};
            if (launchConfig.sourceLanguages) {
                adapterParams.sourceLanguages = launchConfig.sourceLanguages;
                delete launchConfig.sourceLanguages;
            }
            exports.output.appendLine('Starting new session with:');
            exports.output.appendLine(util_1.inspect(launchConfig));
            try {
                // If configuration does not provide debugServer explicitly, launch new adapter.
                if (!launchConfig.debugServer) {
                    let adapter = yield startup.startDebugAdapter(this.context, folder, adapterParams);
                    this.launching.push([launchConfig.name, adapter]);
                    launchConfig.debugServer = adapter.port;
                }
                // For adapter debugging
                if (launchConfig._adapterStartDelay) {
                    yield new Promise(resolve => setTimeout(resolve, launchConfig._adapterStartDelay));
                }
                launchConfig._displaySettings = this.context.globalState.get('display_settings') || new DisplaySettings();
                return launchConfig;
            }
            catch (err) {
                startup.analyzeStartupError(err);
                return null;
            }
        });
    }
    // Merge launch configuration with workspace settings
    mergeWorkspaceSettings(debugConfig, launchConfig) {
        let mergeConfig = (key, reverse = false) => {
            let value1 = util.getConfigNoDefault(launchConfig, key);
            let value2 = debugConfig[key];
            let value = !reverse ? util.mergeValues(value1, value2) : util.mergeValues(value2, value1);
            if (!util.isEmpty(value))
                debugConfig[key] = value;
        };
        mergeConfig('initCommands');
        mergeConfig('preRunCommands');
        mergeConfig('postRunCommands');
        mergeConfig('exitCommands', true);
        mergeConfig('env');
        mergeConfig('cwd');
        mergeConfig('terminal');
        mergeConfig('stdio');
        mergeConfig('expressions');
        mergeConfig('sourceMap');
        mergeConfig('sourceLanguages');
        return debugConfig;
    }
    // Expands variable references of the form ${dbgconfig:name} in all properties of launch configuration.
    expandDbgConfig(debugConfig, dbgconfigConfig) {
        let dbgconfig = Object.assign({}, dbgconfigConfig);
        // Compute fixed-point of expansion of dbgconfig properties.
        var expanding = '';
        var converged = true;
        let expander = (type, key) => {
            if (type == 'dbgconfig') {
                if (key == expanding)
                    throw new Error('Circular dependency detected during expansion of dbgconfig:' + key);
                let value = dbgconfig[key];
                if (value == undefined)
                    throw new Error('dbgconfig:' + key + ' is not defined');
                converged = false;
                return value.toString();
            }
            return null;
        };
        do {
            converged = true;
            for (var prop of Object.keys(dbgconfig)) {
                expanding = prop;
                dbgconfig[prop] = util.expandVariablesInObject(dbgconfig[prop], expander);
            }
        } while (!converged);
        // Now expand dbgconfigs in the launch configuration.
        debugConfig = util.expandVariablesInObject(debugConfig, (type, key) => {
            if (type == 'dbgconfig') {
                let value = dbgconfig[key];
                if (value == undefined)
                    throw new Error('dbgconfig:' + key + ' is not defined');
                return value.toString();
            }
            return null;
        });
        return debugConfig;
    }
    onStartedDebugSession(session) {
        if (session.type == 'lldb') {
            // VSCode does not provide a way to associate a piece of data with a DebugSession
            // being launched via vscode.startDebug, so we are saving AdapterProcess'es in
            // this.launching and then try to re-associate them with correct DebugSessions
            // once we get this notification. >:-(
            for (var i = 0; i < this.launching.length; ++i) {
                let [name, adapter] = this.launching[i];
                if (session.name == name) {
                    this.activeSessions[session.id] = new ActiveDebugSession(adapter, session);
                    this.launching.splice(i, 1);
                    return;
                }
                // Clean out entries that became stale for some reason.
                if (!adapter.isAlive) {
                    this.launching.splice(i--, 1);
                }
            }
        }
    }
    onTerminatedDebugSession(session) {
        if (session.type == 'lldb') {
            let activeSession = this.activeSessions[session.id];
            if (activeSession) {
                // Adapter should exit automatically when VSCode disconnects, but in case it
                // doesn't, we kill it (after giving a bit of time to shut down gracefully).
                setTimeout(() => activeSession.adapter.terminate(), 1500);
            }
            delete this.activeSessions[session.id];
        }
    }
    onDebugSessionCustomEvent(e) {
        if (e.session.type == 'lldb') {
            if (e.event = 'displayHtml') {
                this.onDisplayHtml(e.session.id, e.body);
            }
        }
    }
    registerDisplaySettingCommand(command, updater) {
        this.context.subscriptions.push(vscode_1.commands.registerCommand(command, () => __awaiter(this, void 0, void 0, function* () {
            if (vscode_1.debug.activeDebugSession && vscode_1.debug.activeDebugSession.type == 'lldb') {
                var settings = this.context.globalState.get('display_settings') || new DisplaySettings();
                yield updater(settings);
                this.context.globalState.update('display_settings', settings);
                yield vscode_1.debug.activeDebugSession.customRequest('displaySettings', settings);
            }
        })));
    }
    pickProcess(currentUserOnly) {
        return __awaiter(this, void 0, void 0, function* () {
            let items = util.getProcessList(currentUserOnly);
            let item = yield vscode_1.window.showQuickPick(items);
            if (item) {
                return item.pid.toString();
            }
            else {
                throw Error('Cancelled');
            }
        });
    }
    /// HTML display stuff ///
    normalizeUri(uri, sessionId) {
        if (uri.scheme && uri.scheme != 'debugger')
            return uri; // Pass through non-debugger URIs.
        return uri.with({ scheme: 'debugger', authority: sessionId });
    }
    onDisplayHtml(sessionId, body) {
        return __awaiter(this, void 0, void 0, function* () {
            var documentUri = this.normalizeUri(vscode_1.Uri.parse(body.uri), sessionId);
            for (var key in body.content) {
                var contentUri = this.normalizeUri(vscode_1.Uri.parse(key), sessionId);
                let content = body.content[key];
                if (content != null) {
                    this.activeSessions[sessionId].previewContent[contentUri.toString()] = content;
                }
                else {
                    delete this.activeSessions[sessionId].previewContent[contentUri.toString()];
                }
                if (contentUri.toString() != documentUri.toString()) {
                    this.previewContentChanged.fire(contentUri);
                }
            }
            this.previewContentChanged.fire(documentUri);
            yield vscode_1.commands.executeCommand('vscode.previewHtml', documentUri.toString(), body.position, body.title, { allowScripts: true, allowSvgs: true });
        });
    }
    provideTextDocumentContent(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (uri.scheme != 'debugger')
                return null; // Should not happen, as we've only registered for 'debugger'.
            let activeSession = this.activeSessions[uri.authority];
            if (!activeSession) {
                console.error('provideTextDocumentContent: Did not find an active debug session for %s', uri.toString());
                return null;
            }
            let uriString = uri.toString();
            if (activeSession.previewContent.hasOwnProperty(uriString)) {
                return activeSession.previewContent[uriString];
            }
            let result = yield activeSession.debugSession.customRequest('provideContent', { uri: uriString });
            return result.content;
        });
    }
    get onDidChange() {
        return this.previewContentChanged.event;
    }
}
;
//# sourceMappingURL=extension.js.map