<template>
  <div class="home">
    <main class="container pb-6 mb-6">
      <h1 class="title title-main has-text-centered">Node Threader</h1>
      <form class="p-6" name="form" @submit="submitButtonPressed">
        <div class="field-body">
          <div class="field has-addons">
            <p class="control is-expanded">
              <input
                id="urlField"
                name="urlField"
                class="input is-primary is-large is-fullwidth"
                type="text"
                placeholder="Paste a Twitter url or a tweet ID"
                v-model="urlField"
              />
            </p>
            <div class="control">
              <button
                type="button"
                class="button is-large is-primary is-outlined"
                @click="pasteButtonPressed"
              >
                <span class="icon">
                  <i class="fas fa-paste"></i>
                </span>
              </button>
            </div>
          </div>
          <div class="control">
            <button class="button is-primary is-large is-fullwidth">
              <b>Threadify</b>
            </button>
          </div>
        </div>
        <p
          class="help is-danger is-size-5"
          :style="{ visibility: urlError ? 'visible' : 'hidden' }"
        >
          {{ urlError || "wontshow" }}
        </p>
      </form>
    </main>
  </div>
</template>

<script>
const baseUrl = "http://127.0.0.1:3000/api/thread/fetch";

export default {
  name: "Home",
  data() {
    return {
      urlField: "",
      urlError: "",
    };
  },
  setup() {},
  components: {},
  methods: {
    async pasteButtonPressed() {
      const text = await navigator.clipboard.readText();
      this.urlField = text;
    },

    async submitButtonPressed(event) {
      event.preventDefault();
      if (this.verifyInput(this.urlField)) {
        let fetchedData = await this.fetchData(this.urlField);
        console.log(fetchedData);
      }
    },

    verifyInput(textInput) {
      this.urlError = "";
      if (!textInput || textInput.trim() == "") {
        this.urlError = "Url field can't be empty";
      }
      return this.urlError == "";
    },

    async fetchData(url) {
      const fetchUrl = `${baseUrl}/${url}`;
      const response = await fetch(fetchUrl, { mode: "no-cors" });
      const fetchedData = await response.json();
      return fetchedData;
    },
  },
};
</script>

<style>
.title-main {
  padding-top: 2em;
  font-family: "roboto";
  font-size: 5em;
}
</style>
