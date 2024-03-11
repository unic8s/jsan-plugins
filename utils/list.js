const path = require('path');
const fs = require('fs');

const directoryPath = path.join(__dirname, "../");

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 

    const plugins = [];

    files.forEach(function (file) {
        if(fs.statSync(file).isDirectory()){
            const realPath = fs.realpathSync(file);
            const manifestPath = path.join(realPath, 'manifest.json');

            if(fs.existsSync(manifestPath)){
                const manifestRaw = fs.readFileSync(manifestPath);
                const manifestData = JSON.parse(manifestRaw);

                plugins.push({
                    name: manifestData.name,
                    uid: manifestData.uid,
                    version: manifestData.version,
                    fileset: [
                        "manifest.json",
                        "plugin.js"
                    ]
                });
            }
        }
    });

    const jsonList = JSON.stringify(plugins, null, 4);

    fs.writeFileSync(path.join(__dirname, "../plugins.json"), jsonList);
});
