
import fs from 'fs';
import path from 'path';

const pathsToDelete = [
    '.next',
    'tsconfig.tsbuildinfo',
    'dist'
];

pathsToDelete.forEach(p => {
    const fullPath = path.join(process.cwd(), p);
    if (fs.existsSync(fullPath)) {
        console.log(`Deleting ${fullPath}...`);
        try {
            fs.rmSync(fullPath, { recursive: true, force: true });
            console.log(`Deleted ${fullPath}`);
        } catch (e) {
            console.error(`Failed to delete ${fullPath}:`, e);
        }
    } else {
        // console.log(`${fullPath} does not exist.`);
    }
});
