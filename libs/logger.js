import * as fs from "fs";
import fetch from "node-fetch";

const dir = './logs';

export async function logMints(hash) {    

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log('Logs directory created.');
    }

    fetch(`https://api.tzkt.io/v1/operations/${hash}`)
    .then(res => res.json())
    .then(res => {
        let log = [];
        let status = 'unknown';
        let diffs = res[0].diffs;
        let block = res[0].level;
        let txn = `https://tzkt.io/${hash}`;
        let price = res[0].amount / 1000000;
        let fee = res[0].bakerFee / 1000000;
        let issuer = 'failed';
        let token_id = 'failed';
        let gentk_id = 0;
        let sender = res[0].sender.address;
        const now = new Date();

        if (res[0].status) {            
            status = res[0].status;
        }

        if (status == 'applied') {
            diffs = res[0].diffs;
            gentk_id = res[0].storage.all_gentk_tokens - 1;
            token_id = res[0].parameter.value;

            diffs.forEach(d => {
                if (d.bigmap == 70072) {
                    issuer = d.content.value.author;
                }
            });
        };

        log.push(now.toString(), block, status, issuer, token_id, gentk_id, price, fee, sender, txn);
        return log;

    }).then(log => {
        logTokens(log[4]);
        const path = `${dir}/mints.csv`;
        const headers = ['Date', 'Block', 'Status', 'Issuer', 'Token ID', 'GENTK ID', 'Price', 'Gas Fee', 'Minted By', 'Transaction'];
        const row = log.join() + "\n"
        
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, `${headers.join()}\n`);
            fs.appendFileSync(path, row);
            console.log('Log file created and mint logged to mint.csv');
        } else {
            fs.appendFile(path, row, (err) => {
                if (err) throw err;
                console.log('Mint logged to mint.csv');
            })
        }

        
    })
    .catch( (error) => {
        console.log(`\n\n********** THERE WAS AN ERROR LOGGING THE MINT FOR A TOKEN **********`);
        console.log(error);
    });
};

export async function logErrors(id, name, msg, sender) {
    let log = [];
    const path = `${dir}/errors.csv`;
    const headers = ['Date', 'Token ID', 'Error', 'Message', 'Minted By'];
    const now = new Date();

    log.push(now.toString(), id, name, msg, sender);    

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log('Logs directory created.');
    }
    
    if (!fs.existsSync(path)) {
        const row = log.join() + "\n";
        fs.writeFileSync(path, `${headers.join()}\n`);
        fs.appendFileSync(path, row);
        console.log('Log created and error logged to errors.csv');
    } else {
        const row = log.join() + "\n";
        fs.appendFile(path, row, (err) => {
            if (err) throw err;
            console.log('Error logged to errors.csv');
        })
    }
};

async function logTokens(gentkId) {
    let log = []
    const path = `${dir}/tokens.csv`;
    const headers = ['date', 'gentkid'];
    const now = new Date();

    log.push(now.toString(), gentkId);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log('Logs directory created.');
    }
    

    if (!fs.existsSync(path)) {
        const row = log.join() + "\n";
        fs.writeFileSync(path, `${headers.join()}\n`);
        fs.appendFileSync(path, row);
        console.log('Log created and gentk ID logged to tokens.csv');
    } else {
        const row = log.join() + "\n";
        fs.appendFile(path, row, (err) => {
            if (err) throw err;
            console.log('Gentk ID logged to tokens.csv');
        })
    }
}

export async function getTokenList() {
    const path = `${dir}/tokens.csv`;

    if (fs.existsSync(path)) {
        let csv = fs.readFileSync(path, {encoding: 'utf-8'}, 
        function(err){console.log(err);});
        let result = [];
        
        csv = csv.split("\n");

        let headers = csv.shift().split(",");

        for (let c=0; c<csv.length; c++) {
            let obj = {};
            let row = csv[c].split(",");

            for(let i=0; i<headers.length; i++) {
                obj[headers[i]] = row[i]
            }
            if (obj.date) {
                result.push(obj);
            }            
        }

        return result;
    } else {
        return [];
    }
}

export async function logData(data, block) {
    const path = `${dir}/blocks/${block}.json`
    

    if (!fs.existsSync(dir + '/blocks')) {
        fs.mkdirSync(dir + '/blocks');
        console.log('Logs directory created.');
    }
    

    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, JSON.stringify(data));
        console.log('Block data logged');
    } else {
        fs.appendFileSync(path, JSON.stringify(data));
        console.log('Block data logged');
    }
}