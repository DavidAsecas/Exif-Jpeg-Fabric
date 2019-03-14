let invoke = require('./invoke');
let query = require('./query');
let helper = require('./helper');
let Fabric_Client = require('fabric-client');
let client = new Fabric_Client();

invoke.createChannel('user1-stonehenge').then(() => {
    return invoke.joinChannel('user1-stonehenge', 'grpcs://localhost:7051', 'peer0');
}).then(() => {
    return helper.installChaincode(client, 'grpcs://localhost:7051', 'peer0');
}).then(() => {
    return invoke.joinChannel('user1-stonehenge', 'grpcs://localhost:7151', 'peer1');
}).then(() => {
    return helper.installChaincode(client, 'grpcs://localhost:7151', 'peer1');
}).then(() => {
    let peer0 = {
        peer: 'peer0',
        url: 'grpcs://localhost:7051'
    }

    let peer1 = {
        peer: 'peer1',
        url: 'grpcs://localhost:7151'
    }

    return helper.instantiateChaincode(client, peer0, peer1, 'user1-stonehenge');
}).then(() => {
    let transaction = {
        idImagen: 'stonehenge',
        hashImagen: 'hash',
        newOwner: 'user2',
        license: {
            adapt: true,
            diminish: false,
            embed: false,
            enhance: true,
            enlarge: true,
            issue: false,
            modify: true,
            play: true,
            print: false,
            reduce: true,
        }
    }
    let stringTransaction = JSON.stringify(transaction);

    let seller = {
        user: 'user1',
        peer: 'peer0',
        url: 'grpcs://localhost:7051'
    };

    let buyer = {
        user: 'user2',
        peer: 'peer1',
        url: 'grpcs://localhost:7151'
    }
    return invoke.newTransaction(seller, buyer, 'user1-stonehenge', stringTransaction);
}).then(() => {
    let transaction = {
        idImagen: 'stonehenge',
        hashImagen: 'hash',
        newOwner: 'user1',
        license: {
            adapt: true,
            diminish: true,
            embed: false,
            enhance: false,
            enlarge: true,
            issue: false,
            modify: false,
            play: true,
            print: true,
            reduce: true,
        }
    }
    let stringTransaction = JSON.stringify(transaction);

    let seller = {
        user: 'user2',
        peer: 'peer1',
        url: 'grpcs://localhost:7151'
    }

    let buyer = {
        user: 'user1',
        peer: 'peer0',
        url: 'grpcs://localhost:7051'
    }
    return invoke.newTransaction(seller, buyer, 'user1-stonehenge', stringTransaction)
}).then(() => {
    let querier = {
        user: 'user1',
        peer: 'peer0',
        url: 'grpcs://localhost:7051'
    }
    return query.getImageHistory('user1-stonehenge', querier, 'stonehenge');
}).then(result => {
    // let regex = new RegExp('\{.*\:\{.*\:.*\}\}', 'g');
    // let stringTransaction = regex.exec(result.toString());
    // console.log("stringTransaction: ")
    // console.log(stringTransaction)
    // let json = stringTransaction[0];
    // console.log(JSON.parse(json))
    console.log("json: ")
    let array = JSON.parse("[" + result.toString() + "]");
    console.log(array)
}).catch(err => {
    console.log(err);
})