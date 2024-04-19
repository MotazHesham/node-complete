const mongodb = require("mongodb"); 
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect(
        "mongodb+srv://node-user:fXWvXI3mf6m2Hxa7@atlascluster.phy2cln.mongodb.net/shop?retryWrites=true&w=majority&appName=AtlasCluster"
    )
    .then((client) => {
        console.log("Connected!");
        _db = client.db(); 
        callback();
    })
    .catch((err) => {
        console.log(err)
        throw err;
    });
};

const getDb = () =>{
    if(_db){
        return _db;
    }
    throw 'No Database found!';
}
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
