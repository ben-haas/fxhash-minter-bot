import fetch from "node-fetch";
import { mintGENTK } from "./taquito.js";
import { artists } from "../wallets.js";
import { params } from "../config.js";
import { getTokenList, logErrors, logData } from "./logger.js";


export async function getTzktData (data, level) {
    if (data) {
        if (params.logBlocks == true) {
            logData(data, level);
        }
        
        const mintedTokens = await getTokenList();
        let mintCount = 0;

        console.log(`${data.length} calls were made to the issuer contract.\n`);

        data.forEach( i => {
            let sender = i.sender.address;
            let senderName = i.sender.alias;
            let hash = i.hash;
            let enabled = false;
            let timelock = 0;
            let onMintedList = false;
            let entrypoint, content, id, amount, updateId;

            if (i.parameter && i.diffs) {

                i.diffs.forEach(d => {
                    if (d.bigmap == 149776) {
                        content = d.content;
                        id = d.content.key;
                        timelock = d.content.value.locked_seconds/60/60;
                    }

                    entrypoint = i.parameter.entrypoint;
                    enabled = i.parameter.value.enabled;

                    if (entrypoint == 'mint_issuer') {
                        data.forEach(txn => {
                            if (txn.hash == hash) {
                                txn.diffs.forEach(diff => {
                                    if (diff.bigmap == 149813) {
                                        amount = diff.content.value.price / 1000000;
                                    }
                                })
                            }
                        })

                    }
                });

                for (let i=0; i<mintedTokens.length; i++) {
                    if (mintedTokens[i].gentkid == id) {
                        onMintedList = true;
                        break;
                    }
                }

            } else {
                entrypoint = 'transaction'
            }

            
            if (entrypoint == 'mint_issuer' && amount > 0) {

                if (timelock == 0) {
                    if (senderName) {
                        console.log(`${senderName} minted a new GENTK.`);
                        if (enabled) {
                            console.log(`Token ID: ${id}, Cost: ${amount}ꜩ\n`);
                        } else if (!enabled) {
                            console.log(`Token is not enabled for minting.\n`);
                        }
                    } else {
                        console.log(`${sender} minted a new GENTK.`);
                        if (enabled) {
                            console.log(`Token ID: ${id}, Cost: ${amount}ꜩ\n`);
                        } else if (!enabled) {
                            console.log(`Token is not enabled for minting\n`);
                        }
                        
                    }
                } else if (timelock > 0) {
                    if (senderName) {
                        console.log(`${senderName} minted a new GENTK.`);
                        console.log(`Token is timelocked for ${timelock} hours...`);
                        if (enabled) {
                            console.log(`Token ID: ${id}, Cost: ${amount}ꜩ\n`);
                        } else if (!enabled) {
                            console.log(`Token is not enabled\n`);
                        }
                    } else {
                        console.log(`${sender} minted a new GENTK.`);
                        console.log(`Token is timelocked for ${timelock} hours...`);
                        if (enabled) {
                            console.log(`Token ID: ${id}, Cost: ${amount}ꜩ\n`);
                        } else if (!enabled) {
                            console.log(`Token is not enabled\n`);
                        }
                        
                    }
                }                
                    
                artists.forEach(a => {
                    if (sender == a.address && enabled && timelock == 0 && onMintedList == false) {
                        if(a.maxCost >= amount || a.maxCost == 0) {
                            console.log(`Attempting to mint ${a.alias} GENTK in ${params.mintDelay/1000} seconds........................................`)
                            params.pKey.forEach(k => {                                
                                if (mintCount < a.mintAmount || a.mintAmount == 0) {
                                    setTimeout(() => {mintGENTK(id, amount, a.gas, k)}, params.mintDelay);
                                    mintCount++;
                                } else {
                                    console.log(`Only minting ${a.mintAmount} GENTK from ${a.alias}`)
                                };
                            });
                        }
                        else{
                            console.log(`Not minting ${a.alias} GENTK. Max mint price of ${a.maxCost} has been exceeded........................................`);
                            logErrors(id, 'Limit', 'Cost limit exceeded', 'Not Submitted');
                        }
                    } else if (sender == a.address && onMintedList == true) {
                        console.log(`Not minting ${a.alias}, the token has already been minted by the bot.`);
                        logErrors(id, senderName, 'Token already minted', 'Not Submitted');
                    } else if (sender == a.address && timelock > 0) {
                        console.log(`Not minting ${a.alias}, the token is timelocked for ${timelock} hours.`);
                        logErrors(id, senderName, 'Token is timelocked', 'Not Submitted');
                    }
                });
                
            } else if (entrypoint == 'update_issuer' && amount > 0) {

                updateId = content.key;

                if (senderName) {
                    if (enabled) {
                        console.log(`${senderName} enabled minting of their GENTK.`);
                        console.log(`Token ID: ${updateId}, Cost: ${amount} ꜩ\n`);
                    } else {
                        console.log(`${senderName} updated their GENTK.`);
                        console.log(`Token ID: ${updateId}, Cost: ${amount} ꜩ\n`);
                    }                    
                } else {
                    if (enabled) {
                        console.log(`${sender} enabled minting of their GENTK.`);
                        console.log(`Token ID: ${updateId}, Cost: ${amount} ꜩ\n`);
                    } else {
                        console.log(`${sender} updated their GENTK.`);
                        console.log(`Token ID: ${updateId}, Cost: ${amount} ꜩ\n`);
                    }
                }

                artists.forEach(a => {
                    if (sender == a.address && enabled && onMintedList == false) {
                        if(a.maxCost >= amount || a.maxCost == 0) {
                            console.log(`Attempting to mint ${a.alias} GENTK in ${params.mintDelay/1000} seconds........................................`)
                            params.pKey.forEach(k => {
                                if (mintCount < a.mintAmount || a.mintAmount == 0) {
                                    setTimeout(() => {mintGENTK(updateId, amount, a.gas, k)}, params.mintDelay);
                                    mintCount++;
                                } else {
                                    console.log(`Only minting ${a.mintAmount} GENTK from ${a.alias}`)
                                }; 
                            });
                        }
                        else {
                            console.log(`Not minting ${a.alias} GENTK. Max mint price of ${a.maxCost} has been exceeded........................................`);
                            logErrors(id, 'Limit', 'Cost limit exceeded', 'Not Submitted');
                        }
                    } else if (sender == a.address && onMintedList == true) {
                        console.log(`Not minting ${a.alias}, the token has already been minted by the bot.`);
                        logErrors(id, senderName, 'Token already minted', 'Not Submitted');
                    }
                });            
            } else if (entrypoint == 'mint_issuer' && amount == 0 && enabled && timelock == "0" && params.freeMints == true) {
                console.log(`Attempting to mint GENTK because it's free........................................`);
                params.freeKey.forEach(k => {
                    mintGENTK(id, amount, 0, k);
                });
            } else if (entrypoint == 'update_issuer' && amount == 0 && enabled && params.freeMints == true) {
                updateId = content.key;
                console.log(`Attempting to mint GENTK because it's free........................................`);
                params.freeKey.forEach(k => {
                    mintGENTK(updateId, amount, 0, k);
                });

            }
        }); 
    }      
};


// async function getTokenPrice(id) {
//     fetch(`https://api.tzkt.io/v1/bigmaps/149813/keys?key=${id}`)
//     .then(res => res.json())
//     .then(keys => {
//         if (keys) {
//             keys.forEach(key => {
//                 if (key.active == true) {
//                     console.log(key.key, key.value.price / 1000000);
//                     return key.value.price / 1000000;
//                 }
//             });
//         }
        
//     })
// };