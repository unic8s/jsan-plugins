const path = require('path');
const fs = require('fs');
const JSZip = require("jszip");

const pluginsPath = path.join(__dirname, '../plugins.json');

if(fs.existsSync(pluginsPath)){
    const pluginsRaw = fs.readFileSync(pluginsPath);
    const pluginsList = JSON.parse(pluginsRaw);

    const outPath = path.join(__dirname, '../out');

    if(!fs.existsSync(outPath)){
        fs.mkdirSync(outPath);
    }

    for(let c1 = 0; c1 < pluginsList.length; c1++){
        const plugin = pluginsList[c1];

        const zip = new JSZip();

        for(let c2 = 0; c2 < plugin.fileset.length; c2++){
            const file = plugin.fileset[c2];
            const filePath = path.join(__dirname, '../', plugin.uid, file);

            if(fs.existsSync(filePath)){
                const fileContent = fs.readFileSync(filePath);

                zip.file(file, fileContent);
            }
        }

        zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
        .pipe(fs.createWriteStream(path.join(outPath, plugin.uid + '.zip')));
    }
}
