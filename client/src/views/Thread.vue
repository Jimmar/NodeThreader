<template>
  <main class="container container-large-padding">
    <div v-if="loaded">
      <section class="section">
        <div class="columns">
          <div class="column is-one-quarter">
            <figure class="image is-128x128">
              <img
                class="is-rounded avatar-image"
                :src="
                  author.profile_image_url || require('@/assets/img/avatar.jpg')
                "
              />
            </figure>
          </div>
          <div class="column">
            <div class="rows">
              <div class="row" style="font-size: x-large">
                <b>
                  {{ author.name }}
                </b>
              </div>
              <div class="row block">
                <a
                  href="https://twitter.com/i/user/<%= author.id %>"
                  target="_blank"
                >
                  <b>@ {{ author.username }} </b>
                </a>
              </div>
              <div class="row block" style="text-align: end">
                {{ thread.length }} tweets | {{ created_at }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div v-for="tweet in thread" :key="tweet.id" class="block tweet">
          <div class="tweet-text is-size-4" v-html="tweet.text"></div>

          <div v-if="tweet.media?.length > 0" class="columns is-multiline">
            <div v-for="media in tweet.media" :key="media.url" class="column">
              <figure v-if="media.type === 'photo'" class="image">
                <img :src="media.url" />
              </figure>

              <video
                v-else-if="
                  media.type == 'animated_gif' || media.type == 'video'
                "
                class="is-size-12"
                :autoplay="media.type === 'animated_gif'"
                :loop="media.type === 'animated_gif'"
                controls
                muted
                poster="{{media.preview_image_url}}"
              >
                <source :src="media.variants[0].url" type="video/mp4" />
              </video>
            </div>
          </div>
          <!--TODO handle "This Tweet is unavailable" case and make it look nicer-->
          <!--TODO find a way to show a spinner/loading till the widget loads-->
          <div
            v-if="tweet.quotedhtml"
            class="column"
            v-html="tweet.quotedhtml"
          ></div>
        </div>
      </section>
      <hr />
    </div>
    <section v-else class="section">
      <Spinner :size="100" />
    </section>
  </main>
</template>

<script>
import Spinner from "../components/Spinner.vue";
import { showDataForTwId } from "../scripts/apis";

export default {
  name: "Thread",
  props: ["threadId"],

  data() {
    return {
      threadData: null,
      loaded: false,
    };
  },
  setup() {},

  computed: {
    //TODO I don't like those, find some other way to get them
    author() {
      return this.threadData?.author;
    },

    thread() {
      return this.threadData?.thread;
    },

    created_at() {
      return this.threadData?.created_at;
    },
  },

  components: { Spinner },

  //TODO maybe not at mounted ? not sure if it's the correct place
  async mounted() {
    // This check is mainly useful for dev
    if (!this.threadData) {
      try {
        let fetchedData = await showDataForTwId(this.threadId);
        if (fetchedData?.status === "ok") {
          this.threadData = fetchedData.data;
        } else {
          throw Error(fetchedData.error);
        }
      } catch (error) {
        console.error(error);
        //TODO redirect to not found or something
        this.$router.push({ name: "NotFound" });
      }
    }

    this.loaded = true;

    // needed for twitter widgets to load
    // TODO look into only calling it if needed
    this.$nextTick(function () {
      twttr.widgets.load();
    });
  },
};
</script>

<style scoped>
.container-large-padding {
  padding-left: 20%;
  padding-right: 20%;
}

.avatar-image {
  width: 128px;
  height: auto;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

.tweet .tweet-text {
  font-family: "roboto";
  margin-bottom: 5px;
  white-space: pre-line;
}

.tweet img {
  border-radius: 5px;
  min-width: 300px;
}

hr {
  position: relative;
  top: 20px;
  height: 6px;
  background: black;
  margin-bottom: 50px;
  border-radius: 5px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

video {
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: -100;
  background-size: cover;
  overflow: hidden;
  border-radius: 15px;
}
</style>
