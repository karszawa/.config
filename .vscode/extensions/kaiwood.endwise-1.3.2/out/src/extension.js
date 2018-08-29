/*
 Copyright (c) 2017 Kai Wood <kwood@kwd.io>

 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
*/
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
const vscode = require("vscode");
function activate(context) {
    let enter = vscode.commands.registerCommand("endwise.enter", () => __awaiter(this, void 0, void 0, function* () {
        yield endwiseEnter();
    }));
    let cmdEnter = vscode.commands.registerCommand("endwise.cmdEnter", () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.commands.executeCommand("cursorEnd");
        yield endwiseEnter(true);
    }));
    // We have to check "acceptSuggestionOnEnter" is set to a value !== "off" if the suggest widget is currently visible,
    // otherwise the suggestion won't be triggered because of the overloaded enter key.
    let checkForAcceptSelectedSuggestion = vscode.commands.registerCommand("endwise.checkForAcceptSelectedSuggestion", () => __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration();
        const suggestionOnEnter = config.get("editor.acceptSuggestionOnEnter");
        if (suggestionOnEnter !== "off") {
            yield vscode.commands.executeCommand("acceptSelectedSuggestion");
        }
        else {
            yield vscode.commands.executeCommand("endwise.enter");
        }
    }));
    context.subscriptions.push(enter);
    context.subscriptions.push(cmdEnter);
    context.subscriptions.push(checkForAcceptSelectedSuggestion);
}
exports.activate = activate;
function endwiseEnter(calledWithModifier = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        const lineNumber = editor.selection.active.line;
        const columnNumber = editor.selection.active.character;
        const lineCount = editor.document.lineCount;
        const lineText = editor.document.lineAt(lineNumber).text;
        const lineLength = lineText.length;
        if (shouldAddEnd(lineText, columnNumber, lineNumber, calledWithModifier, editor)) {
            yield editor.edit(textEditor => {
                textEditor.insert(new vscode.Position(lineNumber, lineLength), `\n${indentationFor(lineText)}end`);
            });
            yield vscode.commands.executeCommand("cursorUp");
            vscode.commands.executeCommand("editor.action.insertLineAfter");
        }
        else {
            yield vscode.commands.executeCommand("lineBreakInsert");
            if (columnNumber === lineText.length) {
                yield vscode.commands.executeCommand("cursorEnd");
                yield vscode.commands.executeCommand("cursorWordStartRight");
            }
            else {
                yield vscode.commands.executeCommand("cursorRight");
                let newLine = yield editor.document.lineAt(editor.selection.active.line)
                    .text;
                if (newLine[1] === " " && newLine.trim().length > 0) {
                    yield vscode.commands.executeCommand("cursorWordEndRight");
                    yield vscode.commands.executeCommand("cursorHome");
                }
            }
        }
    });
}
/**
 * Check if a closing "end" should be set
 */
function shouldAddEnd(lineText, columnNumber, lineNumber, calledWithModifier, editor) {
    const openings = [
        /^\s*?if(\s|\()/,
        /^\s*?unless(\s|\()/,
        /^\s*?while(\s|\()/,
        /^\s*?for(\s|\()/,
        /\s?do($|\s\|.*\|$)/,
        /^\s*?def\s/,
        /^\s*?class\s/,
        /^\s*?module\s/,
        /^\s*?case(\s|\()/,
        /^\s*?begin\s/,
        /^\s*?until(\s|\()/
    ];
    const singleLineDefCondition = /;\s*end[\s;]*$/;
    const currentIndentation = indentationFor(lineText);
    // Do not add "end" if enter is pressed in the middle of a line, *except* when a modifier key is used
    // Also, do not add "end" for single line definition
    if ((!calledWithModifier && lineText.length > columnNumber) ||
        lineText.match(singleLineDefCondition)) {
        return false;
    }
    for (let condition of openings) {
        if (lineText.match(condition)) {
            const LIMIT = 100000;
            let stackCount = 0;
            // Do not add "end" if code structure is already balanced
            for (let ln = lineNumber; ln <= lineNumber + LIMIT; ln++) {
                try {
                    let line = editor.document.lineAt(ln + 1).text;
                    if (currentIndentation === indentationFor(line)) {
                        // If another opening is found, increment the stack counter
                        for (let innerCondition of openings) {
                            if (line.match(innerCondition)) {
                                stackCount += 1;
                                break;
                            }
                        }
                        if (line.trim().startsWith("end")) {
                            if (stackCount > 0) {
                                stackCount -= 1;
                                continue;
                            }
                            else {
                                return false;
                            }
                        }
                    }
                    else if (currentIndentation > indentationFor(line)) {
                        if (line.trim().startsWith("end"))
                            return true; // If there is an "end" on a smaller indentation level, always close statement.
                    }
                }
                catch (err) {
                    return true;
                }
            }
            return false;
        }
    }
    return false;
}
/**
 * Get indentation level of the previous line
 */
function indentationFor(lineText) {
    const trimmedLine = lineText.trim();
    if (trimmedLine.length === 0)
        return lineText;
    const whitespaceEndsAt = lineText.indexOf(trimmedLine);
    const indentation = lineText.substr(0, whitespaceEndsAt);
    return indentation;
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map