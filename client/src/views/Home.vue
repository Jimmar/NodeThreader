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
                :disabled="fetching"
              />
            </p>
            <div class="control">
              <button
                type="button"
                class="button is-large is-primary is-outlined"
                @click="pasteButtonPressed"
                :disabled="fetching"
              >
                <span class="icon">
                  <i class="fas fa-paste"></i>
                </span>
              </button>
            </div>
          </div>
          <div class="control">
            <button
              class="button is-primary is-large is-fullwidth"
              :style="{ 'pointer-events': fetching ? 'none' : 'auto' }"
            >
              <Spinner :hide="!fetching" position="absolute"/>
              <div :style="{ visibility: !fetching ? 'visible' : 'hidden' }">
                <b>Threadify</b>
              </div>
            </button>
          </div>
        </div>
        <p
          class="help is-danger is-size-5"
          :style="{ visibility: errorField ? 'visible' : 'hidden' }"
        >
          {{ errorField || "wontshow" }}
        </p>
      </form>
    </main>
  </div>
</template>

<script>
import { verifyInput, fetchDataForTwUrl } from "../scripts/apis";
import Spinner from "../components/Spinner";

export default {
  name: "Home",
  data() {
    return {
      urlField: "",
      errorField: "",
      fetching: false,
    };
  },
  setup() {},
  components: {
    Spinner
  },
  methods: {
    async pasteButtonPressed() {
      const text = await navigator.clipboard.readText();
      this.urlField = text;
    },

    async submitButtonPressed(event) {
      event.preventDefault();
      this.errorField = "";
      this.fetching = true;
      try {
        verifyInput(this.urlField);
        let fetchedData = await fetchDataForTwUrl(this.urlField);
        if (fetchedData?.status === "ok") {
          console.log("data fetched");
          console.log(fetchedData.data);
          this.$router.push({
            name: "Thread",
            params: {
              threadId: fetchedData.data.conversation_id,
              threadDataJson: JSON.stringify(fetchedData.data),
            },
          });
          //TODO redirect to thread page
        } else {
          throw Error(fetchedData.error);
        }
      } catch (error) {
        console.error(error);
        this.errorField = error.message;
      }

      this.fetching = false;
    },
  },
};
</script>

<style scoped>
.title-main {
  padding-top: 2em;
  font-family: "roboto";
  font-size: 5em;
}
</style>
