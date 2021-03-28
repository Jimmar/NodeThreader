import { deepStrictEqual } from "assert";
import fs from "fs";
import { cleanRecursiveThread, extractMediaFromThread, expandTweetUrls } from "../../src/services/threader.js";

const FIXTURES = "test/fixtures";

describe("cleanRecursiveThread", () => {
  const dataInput = JSON.parse(fs.readFileSync(`${FIXTURES}/data_input/threadRecursive.json`));
  const expectedOutput = JSON.parse(fs.readFileSync(`${FIXTURES}/expected_output/threadRecursiveCleaned.json`));

  it("clean the thread", () => {
    deepStrictEqual(cleanRecursiveThread(dataInput), expectedOutput);
  });
});

describe("extract media from thread", () => {
  const dataInput = JSON.parse(fs.readFileSync(`${FIXTURES}/data_input/threadMultiPictures.json`));
  const expectedOutput = JSON.parse(fs.readFileSync(`${FIXTURES}/expected_output/mediaThreadMultiPictures.json`));

  it("should extract media", () => {
    deepStrictEqual(extractMediaFromThread(dataInput), expectedOutput);
  });
});

describe("expand Tweet urls", async () => {
  it("should expand tweet urls don't remove self urls", async () => {
    const dataInput = "test tweet with url https://t.co/Qlk7YTQpG8 and here's another url https://t.co/Qlk7YTQpG8";
    const expectedOutput = "test tweet with url https://twitter.com/wxndbard/status/1368927896132272129/photo/1 and here's another url https://twitter.com/wxndbard/status/1368927896132272129/photo/1";
    const output = await expandTweetUrls({ tweetText: dataInput, removeSelfUrl: false });
    deepStrictEqual(output, expectedOutput);
  }).timeout(5000);

  it("should expand tweet urls and remove self urls", async () => {
    const dataInput = "test tweet with url https://t.co/Qlk7YTQpG8 and here's another url https://t.co/Qlk7YTQpG8";
    const expectedOutput = "test tweet with url and here's another url";
    const output = await expandTweetUrls({tweetText: dataInput});
    deepStrictEqual(output, expectedOutput);
  }).timeout(5000);


  it("should expand tweet urls and remove self urls but keep real url", async () => {
    const dataInput = "The Q&A livestream is beginning! Join to learn about #crypto, #bitcoin, and open blockchains: https://t.co/BKojmoEMEe https://t.co/PxnNojWb8b";
    const expectedOutput = "The Q&A livestream is beginning! Join to learn about #crypto, #bitcoin, and open blockchains: https://aantonop.io/mar21qa";
    const output = await expandTweetUrls({tweetText: dataInput});
    deepStrictEqual(output, expectedOutput);
  }).timeout(5000);
});
