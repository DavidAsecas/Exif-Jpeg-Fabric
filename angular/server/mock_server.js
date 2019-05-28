let express = require('express');
let app = express();
let cors = require('cors');

app.options('*', cors())
app.use(cors())

let router = express.Router();

router.post('/putMetadata', function (req, res) {
    setTimeout(() => {
        console.log('timeout');
        res.status(200).send({
            message: 'timeout'
        })
    }, 10000);
})

router.get('/getHistory', function (req, res) {
    let response = [
        {
            idImage: "user",
            hashImage: "hash",
            newOwner: "owner",
            license: {
                adapt: false,
                diminish: false,
                embed: false,
                enhance: false,
                enlarge: false,
                issue: false,
                modify: false,
                play: false,
                print: false,
                reduce: false
            }
        }, 
        {
            idImage: "user2",
            hashImage: "hash2",
            newOwner: "owner2",
            license: {
                adapt: true,
                diminish: false,
                embed: false,
                enhance: true,
                enlarge: false,
                issue: false,
                modify: true,
                play: false,
                print: false,
                reduce: false
            }
        }, 
        {
            idImage: "user2",
            hashImage: "hash2",
            newOwner: "owner2",
            license: {
                adapt: true,
                diminish: false,
                embed: false,
                enhance: true,
                enlarge: false,
                issue: false,
                modify: true,
                play: false,
                print: false,
                reduce: false
            }
        }, 
        {
            idImage: "user2",
            hashImage: "hash2",
            newOwner: "owner2",
            license: {
                adapt: true,
                diminish: false,
                embed: false,
                enhance: true,
                enlarge: false,
                issue: false,
                modify: true,
                play: false,
                print: false,
                reduce: false
            }
        }, 
        {
            idImage: "user2",
            hashImage: "hash2",
            newOwner: "owner2",
            license: {
                adapt: true,
                diminish: false,
                embed: false,
                enhance: true,
                enlarge: false,
                issue: false,
                modify: true,
                play: false,
                print: false,
                reduce: false
            }
        }, 
        {
            idImage: "user2",
            hashImage: "hash2",
            newOwner: "owner2",
            license: {
                adapt: true,
                diminish: false,
                embed: false,
                enhance: true,
                enlarge: false,
                issue: false,
                modify: true,
                play: false,
                print: false,
                reduce: false
            }
        }, 
        {
            idImage: "user2",
            hashImage: "hash2",
            newOwner: "owner2",
            license: {
                adapt: true,
                diminish: false,
                embed: false,
                enhance: true,
                enlarge: false,
                issue: false,
                modify: true,
                play: false,
                print: false,
                reduce: false
            }
        }, 
        {
            idImage: "user2",
            hashImage: "hash2",
            newOwner: "owner2",
            license: {
                adapt: true,
                diminish: false,
                embed: false,
                enhance: true,
                enlarge: false,
                issue: false,
                modify: true,
                play: false,
                print: false,
                reduce: false
            }
        }, 
        {
            idImage: "user2",
            hashImage: "hash2",
            newOwner: "owner2",
            license: {
                adapt: true,
                diminish: false,
                embed: false,
                enhance: true,
                enlarge: false,
                issue: false,
                modify: true,
                play: false,
                print: false,
                reduce: false
            }
        }, 
        {
            idImage: "user2",
            hashImage: "hash2",
            newOwner: "owner2",
            license: {
                adapt: true,
                diminish: false,
                embed: false,
                enhance: true,
                enlarge: false,
                issue: false,
                modify: true,
                play: false,
                print: false,
                reduce: false
            }
        }, 
        {
            idImage: "user2",
            hashImage: "hash2",
            newOwner: "owner2",
            license: {
                adapt: true,
                diminish: false,
                embed: false,
                enhance: true,
                enlarge: false,
                issue: false,
                modify: true,
                play: false,
                print: false,
                reduce: false
            }
        }]
    res.status(200).send({
        queryResponse: response
    })
})

app.use('/api', router)

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});