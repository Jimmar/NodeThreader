import { deepStrictEqual } from "assert";
import fs from "fs";
import {
  cleanRecursiveThread,
  extractMediaFromThread,
  expandTweetUrls,
  hyperlinkHashTags,
  hyperlinkAts,
} from "../../src/services/threader.js";

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
    const expectedOutput =
      "test tweet with url https://twitter.com/wxndbard/status/1368927896132272129/photo/1 and here's another url https://twitter.com/wxndbard/status/1368927896132272129/photo/1";
    const output = await expandTweetUrls({ tweetText: dataInput, removeSelfUrl: false });
    deepStrictEqual(output, expectedOutput);
  }).timeout(5000);

  it("should expand tweet urls and remove self urls", async () => {
    const dataInput = "test tweet with url https://t.co/Qlk7YTQpG8 and here's another url https://t.co/Qlk7YTQpG8";
    const expectedOutput = "test tweet with url and here's another url";
    const output = await expandTweetUrls({ tweetText: dataInput });
    deepStrictEqual(output, expectedOutput);
  }).timeout(5000);

  it("should expand tweet urls and remove self urls but keep real url", async () => {
    const dataInput =
      "The Q&A livestream is beginning! Join to learn about #crypto, #bitcoin, and open blockchains: https://t.co/BKojmoEMEe https://t.co/PxnNojWb8b";
    const expectedOutput =
      "The Q&A livestream is beginning! Join to learn about #crypto, #bitcoin, and open blockchains: https://aantonop.io/mar21qa";
    const output = await expandTweetUrls({ tweetText: dataInput });
    deepStrictEqual(output, expectedOutput);
  }).timeout(5000);

  it("should expand tweet urls and replace it with <a> tag", async () => {
    const dataInput =
      "The Q&A livestream is beginning! Join to learn about #crypto, #bitcoin, and open blockchains: https://t.co/BKojmoEMEe https://t.co/PxnNojWb8b";
    const expectedOutput =
      "The Q&A livestream is beginning! Join to learn about #crypto, #bitcoin, and open blockchains: <a href=https://aantonop.io/mar21qa>https://aantonop.io/mar21qa</a>";
    const output = await expandTweetUrls({ tweetText: dataInput, addAHrefTag: true });
    deepStrictEqual(output, expectedOutput);
  }).timeout(5000);
});

describe("replace hasthags with hyperlinks", () => {
  const dataInput = "This is a #test tweet that includes #hashtags in #لغات_عدة and works fine";
  const expectedOutput =
    "This is a <a href=https://twitter.com/hashtag/test>#test</a> tweet that includes <a href=https://twitter.com/hashtag/hashtags>#hashtags</a> in <a href=https://twitter.com/hashtag/لغات_عدة>#لغات_عدة</a> and works fine";

  it("replace hashtags with hyperlinks", () => {
    deepStrictEqual(hyperlinkHashTags(dataInput), expectedOutput);
  });
});

describe("replace mention handles with hyperlinks", () => {
  const dataInput = "This is a test tweet that mentions @Twitter and @TwitterSupport";
  const expectedOutput =
    "This is a test tweet that mentions <a href=https://twitter.com/Twitter>@Twitter</a> and <a href=https://twitter.com/TwitterSupport>@TwitterSupport</a>";

  it("replace hashtags with hyperlinks", () => {
    deepStrictEqual(hyperlinkAts(dataInput), expectedOutput);
  });
});
