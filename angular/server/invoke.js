let Fabric_Client = require('fabric-client');
let path = require('path');
let fs = require('fs');
let util = require('util');
let helper = require('./helper.js');
let serverCert = fs.readFileSync(path.join(__dirname, '..', '..', 'crypto-config/peerOrganizations/app.jpeg.com/msp/tlscacerts/tlsca.app.jpeg.com-cert.pem'));
let orderCert = fs.readFileSync(path.join(__dirname, '..', '..', 'crypto-config/ordererOrganizations/jpeg.com/msp/tlscacerts/tlsca.jpeg.com-cert.pem'));

module.exports.joinChannel = function (channelID, peerUrl, targetPeerId) {
	return new Promise((resolve, reject) => {
		let fabric_client = new Fabric_Client();
		let channel = fabric_client.newChannel(channelID)
		let peer = fabric_client.newPeer(peerUrl, {
			pem: Buffer.from(serverCert).toString(),
			"ssl-target-name-override": targetPeerId + '.app.jpeg.com'
		});
		let order = fabric_client.newOrderer('grpcs://localhost:7050', {
			pem: Buffer.from(orderCert).toString(),
			'ssl-target-name-override': 'orderer.jpeg.com'
		})
		helper.loadUser(fabric_client, 'Admin')
			.then(user_from_store => {
				// get a transaction id object based on the current user assigned to fabric client
				let tx_id = fabric_client.newTransactionID();
				let genesisBlock;
				let ordererRequest = {
					txId: tx_id,
					orderer: order
				}
				return channel.getGenesisBlock(ordererRequest).then(block => {
					genesisBlock = block
					tx_id = fabric_client.newTransactionID();
					let joinChannelRequest = {
						targets: [peer],
						block: genesisBlock,
						txId: tx_id
					}
					return channel.joinChannel(joinChannelRequest);
				});
			}).then(proposalResponse => {
				if (proposalResponse && proposalResponse[0].response.status == 200) {
					let status = proposalResponse[0].response.status;
					resolve(status);
				} else {
					reject(status);
				}
			}).catch(err => {
				reject(err);
			})
	})
}

module.exports.createChannel = function (channelID) {
	return new Promise((resolve, reject) => {
		let fabric_client = new Fabric_Client();
		let order = fabric_client.newOrderer('grpcs://localhost:7050', {
			pem: Buffer.from(orderCert).toString(),
			'ssl-target-name-override': 'orderer.jpeg.com'
		});

		helper.loadUser(fabric_client, 'Admin').then(user_from_store => {
			let envelope = fs.readFileSync(path.join(__dirname, '..', '..', 'channel-artifacts', channelID + '.tx'))
			let config = fabric_client.extractChannelConfig(envelope);
			let signatures = [];
			let signature = fabric_client.signChannelConfig(config);
			signatures.push(signature);
			let txId = fabric_client.newTransactionID();
			let channelRequest = {
				name: channelID,
				orderer: order,
				config: config,
				signatures: signatures,
				txId: txId
			};
			fabric_client.createChannel(channelRequest).then(response => {
				if (response.status == 'SUCCESS')
					resolve(response.status);
				else {
					reject(response.status)
				}
			})
		})
	})
}

module.exports.newTransaction = function (seller, buyer, ch, transaction) {
	return new Promise((resolve, reject) => {
		let fabric_client = new Fabric_Client();
		let channel = fabric_client.newChannel(ch);
		let sellerPeer = fabric_client.newPeer(seller.url, {
			pem: Buffer.from(serverCert).toString(),
			"ssl-target-name-override": seller.peer + '.app.jpeg.com'
		});
		let buyerPeer = fabric_client.newPeer(buyer.url, {
			pem: Buffer.from(serverCert).toString(),
			"ssl-target-name-override": buyer.peer + '.app.jpeg.com'
		});
		channel.addPeer(sellerPeer);
		channel.addPeer(buyerPeer);

		let order = fabric_client.newOrderer('grpcs://localhost:7050', {
			pem: Buffer.from(orderCert).toString(),
			'ssl-target-name-override': 'orderer.jpeg.com'
		})
		channel.addOrderer(order);

		let store_path = path.join(__dirname, '..', '..', 'crypto-config/peerOrganizations/app.jpeg.com/ca');
		var tx_id = null;

		// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
		helper.loadUser(fabric_client, seller.userName).then(user_from_store => {
			// get a transaction id object based on the current user assigned to fabric client
			tx_id = fabric_client.newTransactionID();

			// let idImagen = transaction.idImagen;
			// let hashImagen = transaction.hashImagen;
			// let newOwner = transaction.newOwner;
			// let license = transaction.license;
			var request = {
				targets: [sellerPeer, buyerPeer],
				chaincodeId: 'jpeg',
				fcn: 'NewTransaction',
				args: [transaction, 'stonehenge'],
				chainId: ch,
				txId: tx_id
			};
			console.log(request)
			// send the transaction proposal to the peers
			return channel.sendTransactionProposal(request);
		}).then((results) => {
			var proposalResponses = results[0];
			var proposal = results[1];
			let isProposalGood = false;
			if (proposalResponses && proposalResponses[0].response &&
				proposalResponses[0].response.status === 200) {
				isProposalGood = true;
				console.log('Transaction proposal was good');
			} else {
				console.error('Transaction proposal was bad');
			}
			if (isProposalGood) {
				console.log(util.format(
					'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
					proposalResponses[0].response.status, proposalResponses[0].response.message));

				// build up the request for the orderer to have the transaction committed
				var request = {
					proposalResponses: proposalResponses,
					proposal: proposal,
					orderer: order,
					txID: tx_id
				};

				// set the transaction listener and set a timeout of 30 sec
				// if the transaction did not get committed within the timeout period,
				// report a TIMEOUT status
				var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
				var promises = [];

				var sendPromise = channel.sendTransaction(request);
				promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

				// get an eventhub once the fabric client has a user assigned. The user
				// is required bacause the event registration must be signed
				let event_hub = channel.newChannelEventHub(sellerPeer);

				// using resolve the promise so that result status may be processed
				// under the then clause rather than having the catch clause process
				// the status
				let txPromise = new Promise((resolve, reject) => {
					let handle = setTimeout(() => {
						event_hub.unregisterTxEvent(transaction_id_string);
						event_hub.disconnect();
						resolve({ event_status: 'TIMEOUT' }); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
					}, 40000);
					event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
						// this is the callback for transaction event status
						// first some clean up of event listener
						clearTimeout(handle);

						// now let the application know what happened
						var return_status = { event_status: code, tx_id: transaction_id_string };
						if (code !== 'VALID') {
							console.error('The transaction was invalid, code = ' + code);
							resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
						} else {
							console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
							resolve(return_status);
						}
					}, (err) => {
						//this is the callback if something goes wrong with the event registration or processing
						reject(new Error('There was a problem with the eventhub ::' + err));
					},
						{ disconnect: true } //disconnect when complete
					);
					event_hub.connect();

				});
				promises.push(txPromise);

				return Promise.all(promises);
			} else {
				console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
				throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
			}
		}).then((results) => {
			console.log('Send transaction promise and event listener promise have completed');
			// check the results in the order the promises were added to the promise all list
			if (results && results[0] && results[0].status === 'SUCCESS') {
				console.log('Successfully sent transaction to the orderer.');
			} else {
				console.error('Failed to order the transaction. Error code: ' + results[0].status);
			}

			if (results && results[1] && results[1].event_status === 'VALID') {
				resolve('Successfully committed the change to the ledger by the peer');
			} else {
				console.log('Transaction failed to be committed to the ledger due to ::' + results[1].event_status);
			}
		}).catch((err) => {
			console.error('Failed to invoke successfully :: ' + err);
			reject(err);
		});
	})
}