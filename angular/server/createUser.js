const Fabric_Client = require('fabric-client');
const path = require('path');
const fs = require('fs');

function createUser () {
    let userName = 'User2';
    let fabric_client = new Fabric_Client();
    let user = null;
    let store_path = path.join(__dirname, '..', '..', 'crypto-config/peerOrganizations/app.jpeg.com/ca');
    let privateKeyPath = path.join(__dirname, '..', '..', 'crypto-config/peerOrganizations/app.jpeg.com/users/' + userName + '@app.jpeg.com/msp/keystore');
    let signedCertPath = path.join(__dirname, '..', '..', 'crypto-config/peerOrganizations/app.jpeg.com/users/' + userName + '@app.jpeg.com/msp/signcerts');
    let privateKeyFile = fs.readdirSync(privateKeyPath);
    let signedCertFile = fs.readdirSync(signedCertPath);
    let privateKey = path.join(privateKeyPath, privateKeyFile[0]);
    let signedCert = path.join(signedCertPath, signedCertFile[0]);

    console.log(privateKey);
    console.log(signedCert);
    
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
        var tlsOptions = {
            trustedRoots: [],
            verify: false
        }
        return fabric_client.createUser({
            username: userName,
            mspid: 'AppMSP',
            cryptoContent: {
                privateKey: privateKey,
                signedCert: signedCert
            }
        })
    }).then(usr => {
        user = usr;
        return fabric_client.setUserContext(usr);
    }).then(() => {
        console.log(user + ' se ha registrado correctamente y esta preparado para interactuar con Fabric')
    }).catch(err => {
        console.error('Failed to register: ' + err);
        if (err.toString().indexOf('Authorization') > -1) {
            console.error('Authorization failures may be caused by having admin credentials from a previous CA instance.\n' +
                'Try again after deleting the contents of the store directory ' + store_path);
        }
    });
}

createUser(process.argv0);