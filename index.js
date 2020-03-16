// library for scraping html content
const cheerio = require('cheerio'); 

// library for handling web requests
const axios = require('axios').default; 

// library for interacting with etherem network
const Web3 = require('web3');

// library for handling OS operations
const fs = require('fs');

const OPTIONS = {
    // defaultBlock: "latest",
    transactionConfirmationBlocks: 1,
    transactionBlockTimeout: 5
};

// For Rinkeby TestNet
const web3 = new Web3("https://ropsten.infura.io/v3/{YOUR API HERE}", null, OPTIONS) 

var ip_addresses = [];
var port_numbers = [];
let proxy;

// HTTP GET request for fetching all proxies. 
axios({
    method: 'get',
    url: 'https://sslproxies.org',
    // responseType: 'stream'
    })
    .then( function (response) {

        if ( response.status == 200) {

            const $ = cheerio.load(response.data);
            $("td:nth-child(1)").each(function(index, value) {
                ip_addresses[index] = $(this).text();
            });
            $("td:nth-child(2)").each(function(index, value) {
                port_numbers[index] = $(this).text();
            });

            ip_addresses.join(", ");
            port_numbers.join(", ");

            console.log('[+] Found ' + (ip_addresses.length-12) + " Proxy IPs.");

            for(let i=0; i< ip_addresses.length -12; i++){

                proxy = "http://"+ip_addresses[i]+":"+port_numbers[i];


                // Request for checking if proxy is usable.  
                axios({
                    method: 'get',
                    url: 'http://ifconfig.co/',
                    timeout:2500,
                    proxy: {
                        host: ip_addresses[i],
                        port: port_numbers[i],
                      }
                }).then(async function(response){
                    if(response.status == 200){

                        // GENERATE ACCOUNT WITH PRIVATE KEY
                        let acc = web3.eth.accounts.create();
                        let add = acc.address;
                        let pk = acc.privateKey
                        ;
                        // append to file
                        // fs.appendFile('message.txt', "http://"+ip_addresses[i]+":"+port_numbers[i] + "\n" + "Public key : " + add + "\nPrivate key : " + pk + "\n\n", function (err) {
                        //     if (err) throw err;
                        //     console.log('Saved!');
                        // });
                        // REQUEST ETHER
                        axios({
                            method : 'get',
                            url: 'https://faucet.ropsten.be/donate/'+add,
                            headers: {
                                'Proxy-Authorization': 'Basic VVZQTnYyLWEzNjRmYWJhYjYyZjZkNmNkMDRiZDY3ZmRhZjc1OWY5MGY1ZWY4MzQzMjE4ZGZlYjE1NjQ1MDU4YzQwYzUxYTcmZTVjYWJmZTBhZEBlbWFpbHRvd24uY2x1YjphMmEzNjQyYjU4N2QwYzJjNGUwZjdjMDA4NGVkNjkxYjI1MjJiZTc5MWUwODQ1MThlYzI5MDVkYzRlODhlNDcy'
                            },
                            proxy: {
                                host: ip_addresses[i],
                                port: port_numbers[i],
                            }
                        }).then(function(response){
                            // if(response.status == 200){
                                console.log('[+] Got an ether!');
                                console.log(response.data);
                                fs.appendFile('message.txt', "\n" + "Public key : " + add + "\nPrivate key : " + pk + "\n\n", function (err) {
                                    if (err) throw err;
                                    console.log('Saved!');
                                });
                            // }
                        }).catch(function(){
                            console.log('[+] Requested Url but failed.');
                        });
                    }
                    
                }).catch(function(error){
                    // console.log("Not working")
                });
            }

        } else {
            console.log("Error loading proxy, please try again");
        }
});