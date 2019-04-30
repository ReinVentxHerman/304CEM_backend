const Express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;
const BodyParser = require("body-parser");
var app = Express();
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', ' *');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', '"Origin, X-Requested-With, Content-Type, Accept');
    next();
});
var db, collection;
var port = (process.env.PORT || 3000);
MongoClient.connect('mongodb+srv://herman:Whatever_528@cluster0-ay2hl.gcp.mongodb.net/test?retryWrites=true', (err, client) => {
    if (err) return console.log(err)
    db = client.db('data')
    db.createCollection("member", function (err, res) {
        db.collection('member').createIndex({ email: 1 }, { sparse: true, unique: true });
    });
    db.createCollection("movie", function (err, res) {
    });

    db.collection('member').save({ "email": "admin@gmail.com", "pw": "123", "type": "A" }, (err, rs) => {
        if (err) {
            console.log("added")
        }
    });


    app.listen(port)
    console.log("Server has started to listen at port: 3000.");
})
app.get('/', (req, res) => {
    res.send("Api is working!!!");
})
app.post('/reg', (req, res) => {
    req.body.type = "M";
    db.collection('member').save(req.body, (err, rs) => {
        if (err) {
            var result = { decide: false }
            return res.send(result);
        } else {
            console.log('saved to database')
            db.collection('member').findOne({ "email": req.body.email }, function (err, result) {
                if (err) return console.log(err)
                result.decide = true;
                res.send(result)
            })
        }

    });
})
app.get('/checkMember/:email/:pw', (req, res) => {
    console.log(req.params.name)
    db.collection('member').findOne({ "email": req.params.email, "pw": req.params.pw }, function (err, result) {
        if (err) return console.log(err)
        if (result) {
            result.decide = true;
            res.send(result)
        } else {
            var result = { decide: false }
            res.send(result)
        }
    })
})
//Movie function
app.post('/addMovie', (req, res) => {
    db.collection('movie').save(req.body, (err, result) => {
        if (err) return res.send(false);
        console.log('saved to database')
        res.send(true);
    });
})
app.post('/addCom', (req, res) => {
    db.collection('comment').save(req.body, (err, result) => {
        if (err) return res.send(false);
        console.log('saved to database')
        res.send(true);
    });
})
app.get('/getCom/:id', (req, res) => {
    const obj = { mvid: ObjectID(req.params.id) };
    db.collection('comment').find({ "mvid": req.params.id }).toArray((err, code) => {
        if (err) return res.send(false);
        res.send(code);
    })
})
app.get('/getAllMovie', (req, res) => {
    db.collection('movie').find().sort({ date: -1 }).toArray((err, result) => {
        if (err) return console.log(err)
        res.send(result)
    })
})
app.delete('/delMv/:id', (req, res) => {
    const obj = { _id: ObjectID(req.params.id) };
    db.collection("movie").remove(obj, function (err, obj) {
        if (err) res.send(false);
        console.log("1 document deleted");
        res.send(true);
    });
})
app.get('/getMv/:id', (req, res) => {
    const obj = { _id: ObjectID(req.params.id) };
    db.collection('movie').findOne(obj, function (err, result) {
        if (err) return res.send(false);
        console.log(result)
        res.send(result)
    })
})
app.put('/editMv/:id', (req, res) => {
    const newvalues = { $set: req.body };
    const obj = { _id: ObjectID(req.params.id) };
    db.collection("movie").updateOne(obj, newvalues, function (err, obj) {
        if (err) throw res.send(false);
        console.log("1 document update");
        res.send(true);
    });
})
app.put('/editCom/:id', (req, res) => {
    const newvalues = { $set: req.body };
    const obj = { _id: ObjectID(req.params.id) };
    db.collection("comment").updateOne(obj, newvalues, function (err, obj) {
        if (err) throw res.send(false);
        console.log("1 document update");
        res.send(true);
    });
})
app.post('/favMv', (req, res) => {
    db.collection('fav').save(req.body, (err, result) => {
        if (err) return res.send(false);
        console.log('saved to database')
        res.send(true);
    });
})
app.get('/getFav/:id/:userid', (req, res) => {
    console.log(req.body)
    const obj = { $and: [{ "mvid": req.params.id }, { "userid": req.params.userid }] }
    console.log(obj)
    db.collection('fav').findOne(obj, function (err, data) {
        if (err) return res.send(false);
        if (data) {
            res.send(true);
        } else {
            res.send(false);
        }
    })
})
app.delete('/unFav/:id/:userid', (req, res) => {
    const obj = { $and: [{ "mvid": req.params.id }, { "userid": req.params.userid }] }
    db.collection("fav").remove(obj, function (err, obj) {
        if (err) res.send(false);
        console.log("1 document deleted");
        res.send(true);
    });
})
app.delete('/delCom/:id', (req, res) => {
    const obj ={ _id: ObjectID(req.params.id) }
    db.collection("comment").remove(obj, function (err, obj) {
        if (err) res.send(false);
        console.log("1 document deleted");
        res.send(true);
    });
})
app.get('/getAllFav/:id', (req, res) => {
    const obj = { userid: ObjectID(req.params.id) };
    db.collection('fav').find({ "userid": req.params.id }).toArray((err, code) => {
        if (err) return res.send(false);
        res.send(code);
    })
})
app.get('/getAllFavMv/:id', (req, res) => {
    const obj = { _id: ObjectID(req.params.id) };
    db.collection('movie').findOne(obj, function (err, data) {
        if (err) return res.send(false);
        console.log(data)
        res.send(data)
    })
})