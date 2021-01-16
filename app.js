import express from "express";
import { promises as fs } from 'fs';
import { cleanTweetObject, extractMediaFromThread, getThreadTweetsForTweetId } from "./src/services/threader.js";
import ejs from "ejs";

const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.set("views", "src/views");
app.use(express.static("src/static"));


app.get("/", (req, res) => {
    res.render("pages/index");
});

app.get("/thread/:thread_id", async (req, res) => {
    const thread_id = req.params?.thread_id;
    const fullThread = await getThreadTweetsForTweetId(thread_id);
    if (fullThread === undefined)
        return res.send(`No thread for id ${thread_id}`);

    let mediaLibrary = extractMediaFromThread(fullThread);
    let threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary));

    res.render("pages/thread", { "thread": threadClean });
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

//     console.time('getThreadTweetsForTweetIdRecursively')
//     let fullThread = await getThreadTweetsForTweetId(tweet_id);
//     console.timeEnd('getThreadTweetsForTweetIdRecursively')

//     await fs.writeFile(`${FIXTURES}/test.json`, JSON.stringify(fullThread));

//     // let mediaLibrary = extractMediaFromThread(fullThread);
//     // let threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaLibrary));

//     // console.log(fullThread)
//     // process.exit();
// })();
