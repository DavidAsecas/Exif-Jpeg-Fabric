let express = require('express');
let app = express();
const bodyParser = require('body-parser');
const query = require('./query');
const invoke = require('./invoke');
const helper = require('./helper');
let Fabric_Client = require('fabric-client');
let client = new Fabric_Client();
let cors = require('cors');

app.options('*', cors())
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let router = express.Router();

router.post('/sellLicense', function (req, res) {
    console.log('sellLicense')
    let seller = req.body.seller;
    let buyer = req.body.buyer;
    let channel = req.body.channel;
    let transaction = req.body.transaction;
    let users = [seller, buyer];
    let promises = [];
    users.forEach(function (user) {
        let promise = new Promise((resolve) => {
            query.getChannels(user).then(chs => {
                let ch = chs.find(function (element) {
                    return element === channel;
                });
                if (ch === undefined) {
                    resolve(user);
                }
                resolve();
            });
        })
        promises.push(promise);
    });
    Promise.all(promises).then(m => {
        let matches = m.filter(element => element !== undefined);
        console.log(matches.length)
        if (matches.length == 2) {
            invoke.createChannel(channel).then(() => {
                return invoke.joinChannel(channel, seller.url, seller.peer);
            }).then(() => {
                return helper.installChaincode(client, seller.url, seller.peer);
            }).then(() => {
                return invoke.joinChannel(channel, buyer.url, buyer.peer);
            }).then(() => {
                return helper.installChaincode(client, buyer.url, buyer.peer);
            }).then(() => {
                return helper.instantiateChaincode(client, matches, channel);
            }).then(() => {
                return invoke.newTransaction(seller, buyer, channel, transaction);
            }).then(response => {
                res.status(200).send({
                    message: response
                });
            })
        } else if (matches.length == 1) {
            let user = matches[0];
            invoke.joinChannel(channel, user.url, user.peer).then(() => {
                return helper.installChaincode(client, user.url, user.peer);
            }).then(() => {
                console.log(client, matches, channel)
                return helper.instantiateChaincode(client, matches, channel);
            }).then(() => {
                return invoke.newTransaction(seller, buyer, channel, transaction);
            }).then(response => {
                res.status(200).send({
                    message: response
                });
            })
        } else if (matches.length == 0) {
            invoke.newTransaction(seller, buyer, channel, transaction).then(response => {
                res.status(200).send({
                    message: response
                });
            })
        }
    })
})

router.get('/getHistory', function (req, res) {
    let request = JSON.parse(req.query.request)
    let channel = request.channel;
    let querier = request.querier;
    let imagen = request.imageId;
    query.getImageHistory(channel, querier, imagen).then(queryResponse => {
        let response = JSON.parse("[" + queryResponse.toString() + "]");
        let history = helper.flatArray(response);
        console.log(history)
        res.status(200).send({
            queryResponse: history
        })
    })
})

router.get('/getHash', function (req, res) {
    helper.hash().then(hash => {
        res.status(200).send({
            hash: hash
        })
    })
})

router.post('/putMetadata', function (req, res) {
    let channel = req.body.channel;
    helper.putMetadata(channel).then(msg => {
        res.status(200).send({
            message: msg
        })
    })
})

router.get('/getChannels', function (req, res) {
    let user = JSON.parse(req.query.user);
    query.getChannels(user).then(channels => {
        res.status(200).send({
            channels: channels
        })
    })
})

router.post('/inheritHistory', function (req, res) {
    console.log('inheritHistory')
    let parent = req.body.parent;
    let child = req.body.child;
    let seller = req.body.seller;
    let buyer = req.body.buyer;
    let image = req.body.image;
    let history;
    let stringHistory;
    if (parent !== undefined) {
        query.getImageHistory(parent, seller, image).then(queryResponse => {
            history = JSON.parse("[" + queryResponse.toString() + "]");
            stringHistory = JSON.stringify(history);
            return invoke.createChannel(child);
        }).then(() => {
            return invoke.joinChannel(child, seller.url, seller.peer);
        }).then(() => {
            return helper.installChaincode(client, seller.url, seller.peer);
        }).then(() => {
            return invoke.joinChannel(child, buyer.url, buyer.peer);
        }).then(() => {
            return helper.installChaincode(client, buyer.url, buyer.peer);
        }).then(() => {
            return helper.instantiateChaincode(client, [seller, buyer], child);
        }).then(() => {
            console.log('newTransaction')
            console.log(stringHistory)
            return invoke.newTransaction(seller, buyer, child, stringHistory);
        }).then(response => {
            res.status(200).send({
                message: response
            });
        })
    } else {
        res.status(200).send({
            message: 'origin'
        });
    }
})

app.use('/api', router)

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

