let express = require('express');
let app = express();
const bodyParser = require('body-parser');
const query = require('./query');
const invoke = require('./invoke');
const helper = require('./helper');
let Fabric_Client = require('fabric-client');
let client = new Fabric_Client();
let cors = require('cors');

app.use(cors())
app.options('*', cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let router = express.Router();

router.post('/sellLicense', function (req, res) {
    let seller = req.body.seller;
    let buyer = req.body.buyer;
    let channel = req.body.channel;
    let transaction = req.body.transaction;

    console.log(req.body);
    invoke.createChannel(channel).then(() => {
        return invoke.joinChannel(channel, seller.url, seller.peer);
    }).then(() => {
        return helper.installChaincode(client, seller.url, seller.peer);
    }).then(() => {
        return invoke.joinChannel(channel, buyer.url, buyer.peer);
    }).then(() => {
        return helper.installChaincode(client, buyer.url, buyer.peer);
    }).then(() => {
        let p1 = {
            peer: seller.peer,
            url: seller.url
        };

        let p2 = {
            peer: buyer.peer,
            url: buyer.url
        };

        return helper.instantiateChaincode(client, p1, p2, channel);
    }).then(() => {
        console.log(transaction)
        let stringTransaction = JSON.stringify(transaction);
        console.log(stringTransaction)
        return invoke.newTransaction(seller, buyer, channel, transaction);
    }).then(response => {
        res.status(200).send({
            message: response
        });
    });
})

router.get('/getHistory', function (req, res) {
    let request = JSON.parse(req.query.request)
    let channel = request.channel;
    let querier = request.querier;
    let imagen = request.imageId;

    console.log(request)
    query.getImageHistory(channel, querier, imagen)
        .then(queryResponse => {
            console.log(queryResponse.toString())
            let response = JSON.parse("[" + queryResponse.toString() + "]");
            res.status(200).send({
                queryResponse: response
            })
        })
})

app.use('/api', router)

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

