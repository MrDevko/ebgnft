"use strict";
const Web3Modal = window.Web3Modal.default;
let web3Modal;
let provider;
let selectedAccount;
let isConnected = false;
let isEligibleForOG = false;
let isEligibleForPR = false;

let contractAddress = "0x01a8f00C64bBcbFe80087a14e9cC48001e8CB810";
let abi = [{
        "inputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "name": "OG_MINT_LIST",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "name": "PR_MINT_LIST",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
        }],
        "name": "OG_Mint",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "OG_live",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
        }],
        "name": "PR_Mint",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "PR_live",
        "outputs": [{
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "_tokensMinted",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    }
]


function init() {
    const providerOptions = {};
    web3Modal = new Web3Modal({
        cacheProvider: false,
        providerOptions,
        disableInjectedProvider: false,
    });
    connect()
}
async function fetchAccountData() {
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    selectedAccount = accounts[0];
}

async function onConnect() {
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
    }

    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    fetchAccountData();
}



async function connect() {
    if (window.web3 == undefined && window.ethereum == undefined) {
        window
            .open("https://metamask.app.link/dapp/ebgnft.xyz", "_blank")
            .focus();
    }
    provider = await web3Modal.connect();
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    await fetchAccountData();
    if (isConnected) {
        return
    }
    if (selectedAccount) {
        const web3 = new Web3(provider);
        const contract = new web3.eth.Contract(abi, contractAddress);

        axios.post("https://sig.ebgnft.xyz/isEligible/", {
            wallet: selectedAccount
        }).then(data => {
            if (data.data.eligible_OG) {
                contract.methods.OG_live().call().then(state => {
                    if (state) {
                        contract.methods.OG_MINT_LIST(selectedAccount).call().then(sState => {
                            if (!sState) {
                                isEligibleForOG = true;
                            }
                        })

                    }
                })
            }

            if (data.data.eligible_PR) {
                contract.methods.PR_live().call().then(state => {
                    if (state) {

                        contract.methods.PR_MINT_LIST(selectedAccount).call().then(sState => {
                            if (!sState) {
                                isEligibleForPR = true;
                            }
                        })

                    }
                })
            }
        }).catch(data => {

        })


        document.getElementById("connect-button").innerHTML = "Connected";
        isConnected = true;
        try {
            contract.methods.totalSupply().call().then(supply => {
                document.getElementById("mintedTokens").innerHTML = parseInt(supply);
            });
        } catch (error) {

        }
        setInterval(async function () {
            try {
                const web3 = new Web3(provider);
                const contract = new web3.eth.Contract(abi, contractAddress);
                contract.methods.totalSupply().call().then(supply => {
                    document.getElementById("mintedTokens").innerHTML = parseInt(supply);

                });
            } catch (error) {

            }
        }, 1000)
    }


}



async function OGMint() {

    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract(abi, contractAddress);
    if (selectedAccount) {

        axios.post("https://sig.ebgnft.xyz/getOGMintAccess/", {
            wallet: selectedAccount,
        }).then(data => {
            if (data.data.signature) {
                contract.methods
                    .OG_Mint(data.data.signature)
                    .send({
                        value: web3.utils.toWei("0.1", "ether"),
                        from: selectedAccount
                    }).then(function (info) {
                        iziToast.success({
                            title: 'OK',
                            message: 'Successfully bought!',
                        });
                    }).catch(function (err) {

                    });
            } else {
                iziToast.error({
                    title: 'Error',
                    message: 'Not whitelisted',
                });
            }

        });
    }
}

async function PRMint() {

    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract(abi, contractAddress);
    if (selectedAccount) {

        axios.post("https://sig.ebgnft.xyz/getPRMintAccess/", {
            wallet: selectedAccount,
        }).then(data => {
            if (data.data.signature) {
                contract.methods
                    .PR_Mint(data.data.signature)
                    .send({
                        value: web3.utils.toWei("0.1", "ether"),
                        from: selectedAccount
                    }).then(function (info) {
                        iziToast.success({
                            title: 'OK',
                            message: 'Successfully bought!',
                        });
                    }).catch(function (err) {

                    });
            } else {
                iziToast.error({
                    title: 'Error',
                    message: 'Not whitelisted',
                });
            }

        });
    }
}

async function mint() {
    if (!isConnected) {
        iziToast.error({
            title: "Error",
            message: "Not connected",
        });
        return
    }
    if (isEligibleForOG == true) {
        OGMint();
        return;
    }
    if (isEligibleForPR == true) {
        PRMint();
        return;
    }
    iziToast.error({
        title: "Error",
        message: "Not Eligible",
    });
}

window.addEventListener("load", async () => {
    init();
})