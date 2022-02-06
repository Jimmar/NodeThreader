import { deepStrictEqual, strictEqual } from "assert";
import dotenv from "dotenv";
import fs from "fs";
import Twitter from "../../src/services/core/tw_api.js";
import { enhanceThreadWithMediaVariants } from "../../src/services/threader.js";

dotenv.config();

const FIXTURES = "test/fixtures";

describe("add media variants for video thread", () => {
  let tw_credentials = {
    key: process.env.TW_KEY,
    secret: process.env.TW_SECRET,
    bearer_token: process.env.TW_BEARER_TOKEN,
  };

  const token = tw_credentials.bearer_token;
  const api = new Twitter(token);

  it("add media variant for video thread", async () => {
    const dataInput = JSON.parse(fs.readFileSync(`${FIXTURES}/data_input/threadMixedMedia.json`));
    const expectedOutput = JSON.parse(fs.readFileSync(`${FIXTURES}/expected_output/threadMixedMediaWithVariants.json`));

    const output = await enhanceThreadWithMediaVariants(dataInput, api);
    deepStrictEqual(output, expectedOutput);
  });

  // TODO test file account owner made account private .. lol ..
  // it("add media variant for gif thread", async () => {
  //   const dataInput = JSON.parse(fs.readFileSync(`${FIXTURES}/data_input/threadGifs.json`));
  //   const expectedOutput = JSON.parse(fs.readFileSync(`${FIXTURES}/expected_output/threadGifsWithVariants.json`));

  //   const output = await enhanceThreadWithMediaVariants(dataInput, api);
  //   strictEqual(output, expectedOutput);
  // });
});
