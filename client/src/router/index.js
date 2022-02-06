import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Thread from "../views/Thread.vue";
import NotFound from "../views/NotFound.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/thread/:threadId",
    name: "Thread",
    props: true,
    component: Thread
  },
  {
    path: "/:pathMatch(.*)*",
    // name: 'NotFound',
    // component: NotFound
    //TODO is this better or 404 ?
    redirect: "/"
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
