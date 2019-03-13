let Fabric_Client = require('fabric-client');
let path = require('path');
let fs = require('fs');
let helper = require('./helper');

module.exports.getImageHistory = function (ch, querier, imagen) {
	return new Promise((resolve, reject) => {
		let fabric_client = new Fabric_Client();
		let serverCert = fs.readFileSync(path.join(__dirname, '..', '..', 'crypto-config/peerOrganizations/app.jpeg.com/msp/tlscacerts/tlsca.app.jpeg.com-cert.pem'));
		let channel = fabric_client.newChannel(ch);
		let peer = fabric_client.newPeer(querier.url, {
			pem: Buffer.from(serverCert).toString(),
			"ssl-target-name-override": querier.peer + '.app.jpeg.com'
		});
		channel.addPeer(peer);
		let store_path = path.join(__dirname, '..', '..', 'crypto-config/peerOrganizations/app.jpeg.com/ca');
		console.log('Store path:' + store_path);

		return helper.loadUser(fabric_client, querier.userName).then((user_from_store) => {
			let request = {
				chaincodeId: 'jpeg',
				fcn: 'GetImageHistory',
				args: [imagen]
			};

			// send the query proposal to the peer
			return channel.queryByChaincode(request);
		}).then((query_responses) => {
			console.log(query_responses);
			console.log("Query has completed, checking results");
			// query_responses could have more than one  results if there multiple peers were used as targets
			if (query_responses && query_responses.length == 1) {
				if (query_responses[0] instanceof Error) {
					console.error("error from query = ", query_responses[0]);
				} else {
					console.log("Response is ", query_responses[0].toString());
					let response = query_responses[0];
					resolve(response);
				}
			} else {
				console.log("No payloads were returned from query");
			}
		}).catch((err) => {
			console.error('Failed to query successfully :: ' + err);
			reject(err);
		});
	})
}
