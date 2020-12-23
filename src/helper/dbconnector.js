import { promises as fs } from 'fs';
import { default as mongodb } from 'mongodb';
//TODO switch to one client per app

async function getDBUri() {
    const mongoCredentials = JSON.parse(await fs.readFile('src/config/mongodbatlas.json'))['mongodb'];
    const mongoUri = `mongodb+srv://${mongoCredentials.username}:${mongoCredentials.password}@cluster0.iikww.mongodb.net/${mongoCredentials.dbname}?retryWrites=true&w=majority`;
    return mongoUri;
}

async function getClient() {
    const client = new mongodb.MongoClient(await getDBUri(), { useNewUrlParser: true, useUnifiedTopology: true });
    return client;
}

export async function storeDataToDB(data) {
    const client = await getClient();
    await client.connect();

    const threadsCollection = client.db("NodeThreader").collection("threads");
    await threadsCollection.insertOne(data);
    client.close();
}

export async function getThreadFromDB(conversation_id) {
    const client = await getClient();
    await client.connect();

    const threadsCollection = client.db("NodeThreader").collection("threads");
    const thread = await threadsCollection.findOne({ "conversation_id": conversation_id.toString() });
    client.close();
    return thread;
}
