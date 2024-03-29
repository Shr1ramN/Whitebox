const vscode = require('vscode');

async function activate(context) {
    console.log('Congratulations, your extension "whitebox" is now active!');

    let disposable = vscode.commands.registerCommand('whitebox.analyzePythonFiles', async function () {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace opened.');
                return;
            }
            const folderPath = workspaceFolders[0].uri.fsPath; // Assuming the first workspace folder

            const pythonFiles = await getPythonFiles(folderPath);
            if (pythonFiles.length === 0) {
                vscode.window.showInformationMessage('No Python files found in the workspace folder.');
                return;
            }

            const summaries = await analyzePythonCode(pythonFiles);
            const summaryFilePath = vscode.Uri.file(`${folderPath}/summaries.txt`);
            await vscode.workspace.fs.writeFile(summaryFilePath, Buffer.from(summaries.join('\n'), 'utf8'));

            vscode.window.showInformationMessage(`Summaries generated and saved to ${summaryFilePath}`);
        } catch (error) {
            console.error('Error analyzing Python files:', error.message);
            vscode.window.showErrorMessage('Error analyzing Python files.');
        }
    });

    context.subscriptions.push(disposable);
}

async function getPythonFiles(folderPath) {
    const pythonFiles = [];
    const files = await vscode.workspace.findFiles('**/*.py');
    files.forEach(file => pythonFiles.push(file.fsPath));
    return pythonFiles;
}

async function analyzePythonCode(files) {
    const summaries = [];

    for (const file of files) {
        const codeContent = await vscode.workspace.fs.readFile(vscode.Uri.file(file));
        summaries.push(`${file}:\n${codeContent.toString()}`);
    }

    return summaries;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
