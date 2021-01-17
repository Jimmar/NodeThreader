import express from "express";
import { promises as fs } from 'fs';
import { cleanTweetObject, extractMediaFromThread, getThreadTweetsForTweetId } from "./src/services/threader.js";
import ejs from "ejs";
import Twitter from "./src/services/core/tw_api.js";

const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.set("views", "src/views");
app.use(express.static("src/static"));


app.get("/", (req, res) => {
    res.render("pages/index");
});

app.get("/thread/:thread_id", async (req, res) => {
    //TODO this should be calling the api function instead of doing it all on it's own
    const thread_id = req.params?.thread_id;
    const fullThread = await getThreadTweetsForTweetId(thread_id);
    if (fullThread === undefined)
        return res.send(`No thread for id ${thread_id}`);

    const mediaLibrary = extractMediaFromThread(fullThread);
    const threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary));
    const created_at = fullThread.data[0].created_at.split("T")[0];
    const author = fullThread.includes.users[0];
    res.render("pages/thread", { "thread": threadClean, "author": author, "created_at": created_at });
});

// =================== APIS ===================
app.get("/api/thread/:thread_id", async (req, res) => {
    const thread_id = req.params?.thread_id;
    const fullThread = await getThreadTweetsForTweetId(thread_id);
    if (fullThread === undefined)
        return res.send(`{error: No thread for id ${thread_id}}`);

    let mediaLibrary = extractMediaFromThread(fullThread);
    let threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary));

    return res.send(JSON.stringify(threadClean));
});
// =================== APIS ===================

app.listen(port, () => {
    console.log(`app running on port:${port}`);
});


// const FIXTURES = "test/fixtures";
// const tweet_id = "1341193051184611331";

// (async () => {

//     console.time('getThreadTweetsForTweetIdRecursively');
//     // let fullThread = await getThreadTweetsForTweetId(tweet_id);
//     const keys = await fs.readFile("src/config/keys.json");
//     const credentials = JSON.parse(keys)["twitter"];
//     const token = credentials.bearer_token;
//     const api = new Twitter(token);
//     const tweet = await api.getTweetWithTweetId(tweet_id);
//     console.timeEnd('getThreadTweetsForTweetIdRecursively');
//     // console.log(JSON.stringify(tweet));

//     // await fs.writeFile(`${FIXTURES}/test.json`, JSON.stringify(fullThread));
//     // console.log(fullThread);

//     // let mediaLibrary = extractMediaFromThread(fullThread);
//     // let threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary));

//     // console.log(fullThread)
//     process.exit();
// })();
