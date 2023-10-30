const vscode = require('vscode');

const trueKeyword = new vscode.CompletionItem('true', vscode.CompletionItemKind.Keyword);
const falseKeyword = new vscode.CompletionItem('false', vscode.CompletionItemKind.Keyword);
const nullKeyword = new vscode.CompletionItem('null', vscode.CompletionItemKind.Keyword);
const defKeyword = new vscode.CompletionItem('def', vscode.CompletionItemKind.Keyword);
const ifKeyword = new vscode.CompletionItem('if', vscode.CompletionItemKind.Keyword);
const elseKeyword = new vscode.CompletionItem('else', vscode.CompletionItemKind.Keyword);
const elseifKeyword = new vscode.CompletionItem('elseif', vscode.CompletionItemKind.Keyword);
const forKeyword = new vscode.CompletionItem('for', vscode.CompletionItemKind.Keyword);
const foreachKeyword = new vscode.CompletionItem('foreach', vscode.CompletionItemKind.Keyword);
const forCodeSnippet = new vscode.CompletionItem('for', vscode.CompletionItemKind.Snippet);
const foreachCodeSnippet = new vscode.CompletionItem('foreach', vscode.CompletionItemKind.Snippet);

forCodeSnippet.insertText = new vscode.SnippetString("for (i = 0; i < 20; i++) {\n\t// TODO: customize at your likings\n};")
forCodeSnippet.sortText = '0';
foreachCodeSnippet.insertText = new vscode.SnippetString("foreach (i in array) {\n\t// TODO: customize at your likings\n};")
foreachCodeSnippet.sortText = '0';

let disposable;

function activate(context) {
    // Indentation
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('slang.indentation')) {
            // Update the language-specific configuration
            const indentation = vscode.workspace.getConfiguration('slang').get('indentation');
            if (indentation) {
                vscode.languages.setLanguageConfiguration('slang', {
                    onEnterRules: [
                        {
                            beforeText: /^\s*{/,
                            action: { indentAction: vscode.IndentAction.Indent }
                        },
                        {
                            beforeText: /^\s*}/,
                            action: { indentAction: vscode.IndentAction.Outdent }
                        }
                        // Add more rules as needed
                    ]
                });
            }
        }
    });
    
    // Provider
    const provider = vscode.languages.registerCompletionItemProvider('slang', {
        provideCompletionItems(document, position) {
            if (document.languageId !== 'slang') {
				return;
			}

			const suggestions = [
                forCodeSnippet, 
                foreachCodeSnippet,
                trueKeyword, 
                falseKeyword, 
                nullKeyword, 
                defKeyword, 
                ifKeyword, 
                elseKeyword, 
                elseifKeyword, 
                forKeyword, 
                foreachKeyword
            ];

            const codeSuggestions = analyzeCode();
			
            for (let index = 0; index < codeSuggestions.length; index++) {
                const element = codeSuggestions[index];
                
                suggestions.push(element);
            }
			
            return suggestions;
    }});

    context.subscriptions.push(disposable);
}

function analyzeCode() {
    const lines = vscode.window.activeTextEditor.document.getText().split('\n');
	const array = [];

    for (const line of lines) {
        // Remove line endings from the current line
        const cleanLine = line.replace(/\n$/, '');

        // Check if the cleaned line is empty or doesn't match your pattern
        if (cleanLine.trim() === '') {
            console.log('Empty line.');
            continue; // Skip to the next line
        }

		const variableRegex = /(\w+)\s*=\s*(.*?);/;
        const matchVar = cleanLine.match(variableRegex);
		const functionRegex = /^def\s+(\w+)\([^)]*\)\s+\{/;
        const matchFunction = cleanLine.match(functionRegex);

        if (matchVar) {
            const variableName = matchVar[1];
            array.push(new vscode.CompletionItem(variableName, vscode.CompletionItemKind.Variable));
        }
        
        if (matchFunction) {
            const functionName = matchFunction[1];
            const ci = new vscode.CompletionItem(functionName, vscode.CompletionItemKind.Function);
            ci.insertText = functionName + "();";
            array.push(ci);
        }
    }

	return array;
}

exports.activate = activate;