import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import { params } from "../config.js";
import { logMints, logErrors } from "./logger.js";

export async function mintGENTK(id, amount, gas, key) {

    const tk = new TezosToolkit(params.RPC);
    let sender;
    const addRandomGas = gas + Math.random();
    const randomGas = parseFloat(addRandomGas.toFixed(4));

    await InMemorySigner.fromSecretKey(key)
        .then(theSigner => {
            tk.setProvider({ signer: theSigner });
            return tk.signer.publicKeyHash();
        })
        .then(address => {
            console.log(`Calling Mint() for ${amount} ꜩ using ${address}.....`);
            sender = address;
            return tk.contract.at(params.fxIssuer);
        })
        .then( c => {     
            if (gas > 0) {
                let fee = randomGas * 1000000;
                return c.methods.mint(id).send({ amount: amount, fee: fee, storageLimit: 3000 });
            } else {
                return c.methods.mint(id).send({ amount: amount, storageLimit: 3000 });
            }            
        })
        .then(op => {
            console.log(`Waiting for ${op.hash} to be confirmed.....`);
            return op.confirmation(1, 10, 360).then(() => op.hash);
        })
        .then(hash => {
            logMints(hash);
            console.log(`Operation confirmed: https://tzkt.io/${hash}`);
        })
        .catch((error) => {
            console.log(`\n\n********** TAQUITO ERROR WHEN TRYING TO MINT TOKEN ${id} **********`)
            console.log(`${error.name}: ${error.message}`);
            logErrors(id, error.name, error.message, sender);
        });
}