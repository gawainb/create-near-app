const chalk = require('chalk');
const reader = require("readline-sync");
const os = require('os');
const sh = require('shelljs')

const installRustupScript = "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y";
const addWasm32TargetScript = "rustup target add wasm32-unknown-unknown";

function isRustupInstalled() {
    console.log(chalk`Checking {bold rustup}...`);
    const result = sh.exec('rustup --version &> /dev/null').code == 0;
    console.log('rustup ', result ? 'installed' : 'not installed');
    return result;
}

function isWasmTargetInstalled() {
    console.log(chalk`Checking if {bold wasm32-unknown-unknown} build target added...`);
    if (!isRustupInstalled()) {
        return false;
    }
    const installedTargets = sh.exec('rustup target list --installed').stdout;
    const result = installedTargets.includes('wasm32-unknown-unknown');
    console.log(chalk`{bold wasm32-unknown-unknown} target `, result ? 'already added' : 'is not added');
    return result;
}

function installRustup() {
    console.log(chalk`Installing {bold rustup}...`);
    sh.exec(installRustupScript);
    sh.exec('source ~/.cargo/env'); // add rust to PATH
}

function addWasm32Target() {
    console.log(chalk`Adding {bold wasm32-unknown-unknown} target...`);
    sh.exec(addWasm32TargetScript);
}

function askYesNoQuestionAndRunFunction(question, functionToRun) {
    for (let attempt = 0; attempt < 4; attempt++) {
        const answer = reader.question(question);
        if (answer.toLowerCase() == 'y' || answer === '') {
            functionToRun();
            return;
        }
        else if (answer.toLowerCase() == 'n') {
            return;
        }
    }
}

const installRustupQuestion = chalk`
To build Rust smart contracts you need to install {bold rustup}: the Rust toolchain installer.
We can run the following command to do it:
        
    {bold ${installRustupScript}}
        
Continue with installation (y/n)?: `;

const addWasm32TragetQuestion = chalk`
To build Rust smart contracts you need to add WebAssembly compiler target to Rust toolchain.
We can run the following command to do it:

    {bold ${addWasm32TargetScript}}
    
Continue with installation (y/n)?: `;

function setupRustAndWasm32Target() {
    if (os.platform() != 'win32') {
        if (!isRustupInstalled()) {
            askYesNoQuestionAndRunFunction(installRustupQuestion, installRustup);
        }
        if (isRustupInstalled() && !isWasmTargetInstalled()) {
            askYesNoQuestionAndRunFunction(addWasm32TragetQuestion, addWasm32Target);
        }
    }
}

module.exports = {
    setupRustAndWasm32Target,
};