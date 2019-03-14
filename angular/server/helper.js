let Fabric_Client = require('fabric-client');
const crypto = require('crypto');
const sha = crypto.createHash('sha256');
const path = require('path');
const fs = require('fs');
const util = require('util');
const cp = require('child_process');

let store_path = path.join(__dirname, '..', '..', 'crypto-config/peerOrganizations/app.jpeg.com/ca');
let chaincode_path = path.join(__dirname, '..', '..', 'chaincode');
let serverCert = fs.readFileSync(path.join(__dirname, '..', '..', 'crypto-config/peerOrganizations/app.jpeg.com/msp/tlscacerts/tlsca.app.jpeg.com-cert.pem'));
let orderCert = fs.readFileSync(path.join(__dirname, '..', '..', 'crypto-config/ordererOrganizations/jpeg.com/msp/tlscacerts/tlsca.jpeg.com-cert.pem'));

module.exports.loadUser = function (fabric_client, user) {
	return new Promise((resolve, reject) => {
		Fabric_Client.newDefaultKeyValueStore({
			path: store_path
		}).then((state_store) => {
			// assign the store to the fabric client
			fabric_client.setStateStore(state_store);
			var crypto_suite = Fabric_Client.newCryptoSuite();
			// use the same location for the state store (where the users' certificate are kept)
			// and the crypto store (where the users' keys are kept)
			var crypto_store = Fabric_Client.newCryptoKeyStore({ path: store_path });
			crypto_suite.setCryptoKeyStore(crypto_store);
			fabric_client.setCryptoSuite(crypto_suite);

			// get the enrolled user from persistence, this user will sign all requests
			let userName = user.charAt(0).toUpperCase() + user.slice(1);
			return fabric_client.getUserContext(userName, true);
		}).then((user_from_store) => {
			if (user_from_store && user_from_store.isEnrolled()) {
				console.log('Successfully loaded ' + user + ' from persistence');
				member_user = user_from_store;
				resolve(user_from_store);
			} else {
				throw new Error('Failed to get ' + user + '.... run registerUser.js');
				reject();
			}
		})
	})
}

module.exports.installChaincode = function (fabric_client, peerUrl, targetPeer) {
	return new Promise((resolve, reject) => {
		let peer = fabric_client.newPeer(peerUrl, {
			pem: Buffer.from(serverCert).toString(),
			"ssl-target-name-override": targetPeer + '.app.jpeg.com'
	
		});
		this.loadUser(fabric_client, 'Admin').then(() => {
			let request = {
				targets: [peer],
				chaincodePath: chaincode_path,
				chaincodeId: 'jpeg',
				chaincodeVersion: 'v1',
				chaincodeType: 'node'
			};
			return fabric_client.installChaincode(request);
		}).then(result => {
			let response = result[0];
			console.log('Chaincode installed in ' + targetPeer)
			resolve(response[0].response.status);
		}).catch(err => {
			reject(err);
		})
	})
}

module.exports.instantiateChaincode = function (fabric_client, peer0, peer1, ch) {
	return new Promise((resolve, reject) => {
		let channel = fabric_client.newChannel(ch);
		let p1 = fabric_client.newPeer(peer0.url, {
			pem: Buffer.from(serverCert).toString(),
			"ssl-target-name-override": peer0.peer + '.app.jpeg.com'
	
		});
		let p2 = fabric_client.newPeer(peer1.url, {
			pem: Buffer.from(serverCert).toString(),
			"ssl-target-name-override": peer1.peer + '.app.jpeg.com'
	
		});
		channel.addPeer(p1);
		channel.addPeer(p2);
		let order = fabric_client.newOrderer('grpcs://localhost:7050', {
			pem: Buffer.from(orderCert).toString(),
			'ssl-target-name-override': 'orderer.jpeg.com'
		})
		channel.addOrderer(order);

		let txId = null;
		this.loadUser(fabric_client, 'Admin').then(() => {
			txId = fabric_client.newTransactionID();
			let request = {
				targets: [p1,p2],
				chaincodeType: 'node',
				chaincodeVersion: 'v1',
				chaincodeId: 'jpeg',
				txId: txId
			}
			return channel.sendInstantiateProposal(request, 60000);
		}).then(results => {
			var proposalResponses = results[0];
			var proposal = results[1];
			console.log(proposalResponses[0]);
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
					txID: txId
				};

				// set the transaction listener and set a timeout of 30 sec
				// if the transaction did not get committed within the timeout period,
				// report a TIMEOUT status
				var transaction_id_string = txId.getTransactionID(); //Get the transaction ID string to be used by the event processing
				var promises = [];

				var sendPromise = channel.sendTransaction(request);
				promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

				// get an eventhub once the fabric client has a user assigned. The user
				// is required bacause the event registration must be signed
				let event_hub = channel.newChannelEventHub(p1);
				let event_hub2 = channel.newChannelEventHub(p2);

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

				let txPromise2 = new Promise((resolve, reject) => {
					let handle = setTimeout(() => {
						event_hub2.unregisterTxEvent(transaction_id_string);
						event_hub2.disconnect();
						resolve({ event_status: 'TIMEOUT' }); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
					}, 40000);
					event_hub2.registerTxEvent(transaction_id_string, (tx, code) => {
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
					event_hub2.connect();

				});
				promises.push(txPromise2);

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
				console.log('Successfully committed the change to the ledger by the peer');
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

module.exports.hash = function() {
	return new Promise((resolve, reject) => {
		fs.readFile(path.join('..', '..', 'stonehenge.jpg'), function(err, data) {
			sha.update(data);
			let hash = sha.digest('hex');
			resolve(hash);
		});
	})
}

module.exports.putMetadata = function(channel) {
	return new Promise((resolve, reject) => {
		cp.spawn('python', [channel]);
		resolve('Metadata updated');
	})
}