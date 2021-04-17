<template>
  <div class="home">
    <main class="container pb-6 mb-6">
      <h1 class="title title-main has-text-centered">Node Threader</h1>
      <form
        class="p-6"
        action="#"
        enctype="application/x-www-form-urlencoded"
        name="form"
      >
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
                v-on:click="pasteButtonPressed"
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
              type="submit"
              onclick="return verifyInput()"
            >
              <b>Threadify</b>
            </button>
          </div>
        </div>
        <p v-if="urlError" class="help is-danger is-size-5">Invalid Twitter url</p>
      </form>
    </main>
  </div>
</template>

<script>
export default {
  name: "Home",
  data: function () {
    return {
      urlField: "",
      urlError: null,
    };
  },
  setup() {},
  components: {},
  methods: {
    async pasteButtonPressed() {
      const text = await navigator.clipboard.readText();
      this.urlField = text;
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
