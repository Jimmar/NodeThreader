import { default as mongodb } from 'mongodb';
import { promises as fs } from 'fs';

async function getDBUri() {
    const mongoCredentials = JSON.parse(await fs.readFile('src/config/mongodbatlas.json'))['mongodb'];
    const mongoUri = `mongodb+srv://${mongoCredentials.username}:${mongoCredentials.password}@cluster0.iikww.mongodb.net/${mongoCredentials.dbname}?retryWrites=true&w=majority`;
    return mongoUri;
}

const MongoClient = mongodb.MongoClient;

const client = new MongoClient(await getDBUri(), { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(async err => {
    const threadsCollection = client.db("NodeThreader").collection("threads");
    // await threadsCollection.insertOne({
    //     "key": "value"
    // });
    // perform actions on the collection object
    client.close();
});
