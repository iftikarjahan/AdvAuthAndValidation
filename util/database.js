const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;


let _db;
const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://iftikarjahan22:mj8snvDwnzrbQWZr@cluster0.11hbt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
    .then((client) => {
      _db=client.db();
      console.log("CONNECTED");
      /*
      ->Here we are just calling the callback function and passing the result as the
      argument
      */ 
      callback(client)
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb=()=>{
  if(_db){
    return _db;
  }
  throw "No database found";
}


exports.mongoConnect=mongoConnect;
exports.getDb=getDb;