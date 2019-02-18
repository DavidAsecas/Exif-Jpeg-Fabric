let express = require('express');
let app = express();
const bodyParser = require('body-parser');
const query = require('./query');
const invoke = require('./invoke');
let cors = require('cors');

app.use(cors())
app.options('*', cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let router = express.Router();

router.post('/newOwner', function (req, res) {
    let channel = req.body.channel;
    let org = req.body.org;
    let image = req.body.image;
    let owner = req.body.owner;

    console.log(req.body);
    invoke.newOwnerTransaction(channel, org, image, owner)
        .then(res => {
            res.status(200).send({
                message: message
            })
        })
})

router.get('/queryOwner', function (req, res) {
    let channel = req.query.channel;
    let org = req.query.org;
    let image = req.query.image;

    console.log(req.query)
    query.queryToChannel(channel, org, image)
        .then(queryResponse => {
            console.log(queryResponse)
            res.status(200).send({
                queryResponse: queryResponse
            })
        })

})

app.use('/api', router)

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

