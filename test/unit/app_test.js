import { deepStrictEqual } from "assert";
import fs from "fs";
import { cleanRecursiveThread } from "../../threader.js";

const FIXTURES = "test/fixtures";

describe("cleanRecursiveThread", async () => {
  const dataInput = JSON.parse(fs.readFileSync(`${FIXTURES}/threadRecursive.json`));
  const expectedOutput = JSON.parse(fs.readFileSync(`${FIXTURES}/threadRecursiveCleaned.json`));

  it("should equal the cleaned artifact", () => {
    deepStrictEqual(cleanRecursiveThread(dataInput), expectedOutput);
  })
})
