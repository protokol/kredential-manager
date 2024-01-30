import { exec } from 'child_process';

const command = `npm run typeorm migration:create ./src/migrations/${process.argv[process.argv.length - 1]}`;

(() =>
    exec(command, (error, stdout, stderr) => {
        if (error !== null) {
            console.error(stderr);
        }
        console.log(stdout);
    }))();
