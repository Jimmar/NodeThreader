
const BASE_URL = "https://node-threader-server.herokuapp.com/api";

export async function fetchDataForTwUrl(url) {
    const fetchUrl = `${BASE_URL}/thread/fetch`;
    const body = { urlField: url };

    const init = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    };

    const response = await fetch(fetchUrl, init);
    const fetchedData = await response.json();
    return fetchedData;
}

export async function showDataForTwId(url) {
    const fetchUrl = `${BASE_URL}/thread/show/${url}`;
    const response = await fetch(fetchUrl);
    const fetchedData = await response.json();
    return fetchedData;
}

export function verifyInput(textInput) {
    if (!textInput || textInput.trim() == "") {
        throw Error("Url field can't be empty");
    }
}
