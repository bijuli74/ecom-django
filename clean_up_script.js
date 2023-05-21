const fs = require('fs');
const path = require('path');

function exploreFolder(folder) {
    const content = fs.readdirSync(folder, { withFileTypes: true });
    content.forEach(s => {
        const target = path.join(folder, s.name);
        if (s.isDirectory()) { return exploreFolder(target); }
        if (!s.isFile()) { return; }
        const stats = fs.statSync(target);
        if (stats.size > 1000) { return; }
        checkFile(target);
    });
}

function checkFile(file) {
    file = fs.realpathSync(file);
    const data = fs.readFileSync(file).toString('utf8');
    if (!data.startsWith('..')) { return; }
    const target = fs.realpathSync(path.join(path.dirname(file), data));
    const stats = fs.statSync(target);
    fs.rmSync(file);
    fs.symlinkSync(target, file, stats.isDirectory() ? 'dir' : 'file');
    console.log(target + ' <===> ' + file);
}

function main() {
    const node_exe = fs.realpathSync(process.argv[0]);
    if (!node_exe) {
        console.error('[ERROR]: node executable path not found');
        return 1;
    }
    const node_root = fs.realpathSync(path.dirname(node_exe));
    exploreFolder(node_root);
    console.log('DONE'); 
}
process.exit(main());