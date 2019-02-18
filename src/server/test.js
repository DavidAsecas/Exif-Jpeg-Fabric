let invoke = require('./invoke');
let query = require('./query');
let helper = require('./helper');
let Fabric_Client = require('fabric-client');
let client = new Fabric_Client();

invoke.createChannel('a-stonehenge').then(() => {
    return invoke.joinChannel('a-stonehenge', 'grpcs://localhost:7051', 'peer0');
}).then(() => {
    return helper.installChaincode(client, 'grpcs://localhost:7051', 'peer0');
}).then(() => {
    return invoke.joinChannel('a-stonehenge', 'grpcs://localhost:7151', 'peer1');
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

    return helper.instantiateChaincode(client, peer0, peer1, 'a-stonehenge');
}).then(() => {
    let transaction = {
        idImagen: 'stonehenge',
        hashImagen: 'hash',
        newOwner: 'User2',
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
        user: 'User1',
        peer: 'peer0',
        url: 'grpcs://localhost:7051'
    };

    let buyer = {
        user: 'User2',
        peer: 'peer1',
        url: 'grpcs://localhost:7151'
    }
    return invoke.newTransaction(seller, buyer, 'a-stonehenge', stringTransaction);
}).then(() => {
    let transaction = {
        idImagen: 'stonehenge',
        hashImagen: 'hash',
        newOwner: 'User1',
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
        user: 'User2',
        peer: 'peer1',
        url: 'grpcs://localhost:7151'
    }

    let buyer = {
        user: 'User1',
        peer: 'peer0',
        url: 'grpcs://localhost:7051'
    }
    return invoke.newTransaction(seller, buyer, 'a-stonehenge', stringTransaction)
}).then(() => {
    let querier = {
        user: 'User1',
        peer: 'peer0',
        url: 'grpcs://localhost:7051'
    }
    return query.getImageHistory('a-stonehenge', querier, 'stonehenge');
}).then(result => {
    let regex = new RegExp('\{.*\:\{.*\:.*\}\}', 'g');
    let stringTransaction = regex.exec(result.toString());
    console.log(stringTransaction)
    let json = stringTransaction[0];
    console.log(JSON.parse(json))
}).catch(err => {
    console.log(err);
})