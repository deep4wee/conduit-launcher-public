const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getImports(file) {
    const content = fs.readFileSync(file, 'utf8');
    const imports = [];
    const importRegex = /import\s+(?:[\w\s{},*]*\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
    }
    return imports;
}

const layers = ['app', 'processes', 'pages', 'widgets', 'features', 'entities', 'shared'];
const layerWeights = { app: 7, processes: 6, pages: 5, widgets: 4, features: 3, entities: 2, shared: 1 };

function checkFSDViolations(srcDir) {
    const files = execSync(`dir /b /s "${srcDir}\\*.ts" "${srcDir}\\*.tsx"`).toString().split('\r\n').filter(Boolean);
    const violations = [];

    for (const file of files) {
        const relativePath = file.replace(srcDir + '\\', '').replace(/\\/g, '/');
        const fileLayerMatch = relativePath.split('/')[0];
        if (!layers.includes(fileLayerMatch)) continue;
        const fileWeight = layerWeights[fileLayerMatch];

        const imports = getImports(file);
        for (const imp of imports) {
            if (imp.startsWith('@/')) {
                const importedLayerMatch = imp.split('/')[1];
                if (layers.includes(importedLayerMatch)) {
                    const importedWeight = layerWeights[importedLayerMatch];
                    if (importedWeight > fileWeight) {
                        violations.push(`${relativePath} imports ${imp} (Layer violation: ${fileLayerMatch} -> ${importedLayerMatch})`);
                    } else if (importedWeight === fileWeight && fileLayerMatch !== 'shared' && fileLayerMatch !== 'app') {
                        const fileSlice = relativePath.split('/')[1];
                        const importedSlice = imp.split('/')[2];
                        if (fileSlice !== importedSlice) {
                             violations.push(`${relativePath} imports ${imp} (Cross-slice violation: ${fileSlice} -> ${importedSlice})`);
                        }
                    }
                }
            }
        }
    }
    return violations;
}

const v = checkFSDViolations('E:\\github\\conduit-launcher\\Frontend\\src');
console.log('Violations found: ' + v.length);
v.forEach(x => console.log(x));
