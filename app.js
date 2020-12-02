import { cleanRecursiveThread, extractMediaFromThread, cleanTweetObject } from "./src/services/threader.js";
import express from "express";

const app = express();
const port = 3000

app.get("/", (req, res) => {
    return res.send("Base page")
})

app.get("/api/thread/:thread_id", (req, res) => {
    const thread_id = req.params?.thread_id;
    return res.send("got id " + thread_id);
})

app.listen(port, () => {
    console.log(`app running on port:${port}`)
})




const FIXTURES = "test/fixtures";
const tweet_id = "1333834585118007300";

// (async () => {

//     // let fullThread = JSON.parse(await fs.readFile(`${FIXTURES}/threadRecursive.json`));
//     // fs.writeFile("tests/fixtures/threadRecursiveCleaned.json", JSON.stringify(cleanThread));

//     let mediaibrary = extractMediaFromThread(fullThread);
//     let threadClean = fullThread.data.map((tweet) => cleanTweetObject(tweet, mediaibrary));

//     console.log(threadClean)
//     // process.exit();
// })();
