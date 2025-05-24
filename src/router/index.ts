import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth';

import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Profile from '@/views/Profile.vue'
import Events from '@/views/events/Events.vue';
import EventDetail from '@/views/events/EventDetail.vue';
import Registration from '@/views/events/Registration.vue';
import Scorecard from '@/views/Scorecard.vue';
import Livescores from '@/views/Livescores.vue';
import Livescores2 from '@/views/Livescores2.vue';
import Results from '@/views/results/Results.vue';
import ResultEvent from '@/views/results/ResultEvent.vue';
import ResultEventPlayer from '@/views/results/ResultsPlayer.vue';
import ResultEventSquad from '@/views/results/ResultsSquad.vue';
import ResultEventPlayers from '@/views/results/ResultEventPlayers.vue';
import ResultEventSquads from '@/views/results/ResultEventSquads.vue';
import ResultEventStandings from '@/views/results/ResultEventStandings.vue';
import Squad from '@/views/Squad.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/events',
    },
    {
      path: '/login',
      component: Login,
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      component: Register,
      meta: { requiresGuest: true },
    },
    {
      path: '/profile',
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: '/events',
      component: Events,
    },
    {
      path: '/events/:eventId',
      component: EventDetail,
    },
    {
      path: '/events/register/:eventId',
      component: Registration,
      meta: { requiresAuth: true },
    },
    { path: '/:pathMatch(.*)*',
      redirect: '/',
    },
    {
      path: '/scorecard',
      component: Scorecard,
    },
    {
      path: '/livescores/:id',
      component: Livescores,
    },
    {
      path: '/live',
      component: Livescores2,
    },
    {
      path: '/squads/:squadId',
      component: Squad
    },
    {
      path: '/results',
      component: Results,
    },
    {
      path: '/results/:eventId',
      component: ResultEvent,
      children: [
        {
          path: '',
          component: ResultEventStandings
        },
        {
          path: 'standings',
          component: ResultEventStandings
        },
        {
          path: 'players',
          component: ResultEventPlayers
        },
        {
          path: 'players/:userId',
          component: ResultEventPlayer,
        },
        {
          path: 'squads',
          component: ResultEventSquads,
        },
        {
          path: 'squads/:squadId',
          component: ResultEventSquad,
        },
      ],
    }
  ],
});

router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();

  // Handle routes requiring authentication
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else if (to.meta.requiresGuest && authStore.isLoggedIn) {
    next('/');
  } else {
    next();
  }
});

export default router
