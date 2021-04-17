import { deepStrictEqual } from "assert";
import fs from "fs";
import { enhanceThreadWithMediaVariants } from "../../src/services/threader.js";
import Twitter from "../../src/services/core/tw_api.js";

const FIXTURES = "test/fixtures";

describe("add media variants for video thread", () => {
  

  const keys = fs.readFileSync("src/config/keys.json");
  const tw_credentials = JSON.parse(keys)["twitter"];
  const token = tw_credentials.bearer_token;
  const api = new Twitter(token);

  it("add media variant for video thread", async () => {
    const dataInput = JSON.parse(fs.readFileSync(`${FIXTURES}/data_input/threadMixedMedia.json`));
    const expectedOutput = JSON.parse(fs.readFileSync(`${FIXTURES}/expected_output/threadMixedMediaWithVariants.json`));

    const output = await enhanceThreadWithMediaVariants(dataInput, api);
    deepStrictEqual(output, expectedOutput);
  })

  it("add media variant for gif thread",  async () => {
    const dataInput = JSON.parse(fs.readFileSync(`${FIXTURES}/data_input/threadGifs.json`));
    const expectedOutput = JSON.parse(fs.readFileSync(`${FIXTURES}/expected_output/threadGifsWithVariants.json`));

    const output = await enhanceThreadWithMediaVariants(dataInput, api);
    deepStrictEqual(output, expectedOutput);
  })
})
