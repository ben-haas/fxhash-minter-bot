# **fx (hash) Auto-Minter Bot**

![fxhash logo](https://github.com/fxhash-wiki/fxhash-community-wiki/raw/main/img/logo.png)

## **USE AT YOUR OWN RISK! THIS BOT REQUIRES A PRIVATE KEY!**

<br>
<br>

### [fxhash](https://www.fxhash.xyz/) is an open platform where artists can publish Generative Tokens which are stored on the Tezos blockchain. Generative Tokens are programs designed to produce random outputs. Once a Generative Token is enabled (when the artist decides it), anyone with a tezos wallet can mint its own unique iteration of the Generative Token. Each iteration produces a unique piece that is stored as a NFT on the tezos blockchain. The NFTs are FA2 compliant, which means that they can be exchanged like any other NFT everywhere in the tezos ecosystem.

<br>

### This bot monitors the `FXHASH Generative Tokens v2` contract for any of the specified wallets calling the `mint_issuer` or `update_issuer` entrypoints. If the monitored action is detected, it uses your private key to mint the token automatically. There are no inputs needed after the bot has started running. You can watch the terminal to monitor what is happenning. It will only mint 1 token per provided private key.

<br>

## Requirements

- Nodejs
- Tezos wallet private key(s) (unencrypted)
- List of artist addresses to follow

## Getting Setup

1. Run `npm install` to build packages
2. Make a copy of the `config_template.js` file and rename it `config.js`
3. Make a copy of the `wallets_template.js` file and rename it `wallets.js`
4. Open `config.js` and fill `rpc`, `freeMints` and `pKey` with your information
   - `rpc` = Tezos RPC
   - `freeMints` = Use `true` or `false` to indicate whether or not to automatically mint any tokens that cost 0 xtz.
   - `pKey` = Your private key(s)
   - `freeKey` = Your private key(s) used only for minting 0 xtz tokens if the `freeMints` parameter is enabled
5. Open `wallets.js` and add or remove any artists you would like to monitor using the provided template entries. You can set custom parameters per artist.
   - `address` = The wallet address of the artist you wish to follow. This has to be the wallet that they will mint tokens from
   - `alias` = Set a name for the address for easy identification
   - `gas` = A custom baker fee. Leave at 0 to use the default. If you set a gas fee, a random amount between 0 and 1 xtz will be added on each transaction to help obfucscate transactions if you are using multiple wallets.
   - `maxCost` = The max mint cost. Leave at 0 if you don't want a max. If you set a `maxCost` of 1, the bot will not mint a token that costs more than 1 xtz.
   - `mintAmount` = How many tokens to mint. Leave at 0 if you want to mint with all of your wallets. The amount of tokens minted is dependent on how many wallets you input into the `pKey` parameter in the `config.js` file

## Using the Bot

To start the bot run `npm run start` in a terminal session. There is no GUI, only printouts in the terminal. Once the bot has initialized, you will see when each block is validated as well as how many rpc calls were made to the tokens contract. If an artist on your list mints or updates a token, you will see what they have done and whether or not the token will be minted by the bot. If a token is minted, the status of the transaction will be tracked.

When a token is successfully minted, it will be logged into a csv file located in the `logs` directory. This directory will be automatically created the first time a log entry is created. This log contains information about the mint transaction. In addition, before the bot mints a token, it checks this log to make sure the token hasn't already been minted.

Anytime an error occurs, such as the max mint price being exceeded,the token already being minted previously, or the token being timelocked, an entry into an error log will be created in the same `logs` directory.

## Limitations

The timelock feature implemented on fx (hash) allows artists to set an opening time for their token to begin minting. Unfortunately, this bot does not currently work on tokens that open for minting after a timelock unless an `update_issuer` call is made after the timelock expires.
