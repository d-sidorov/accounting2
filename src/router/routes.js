const routes = [
    {
      path: '/',
      component: () => import('layouts/MainLayout.vue'),
      children: [
        { path: '', component: () => import('pages/mainApp/Index.vue') }
      ]
    },
    {
      path: '/deal',
      component: () => import('layouts/MainLayout.vue'),
      children: [
        { path: '', component: () => import('pages/dealApp/Index.vue') }
      ]
    },
    {
      path: '/install',
      component: () => import('layouts/InstallLayout.vue'),
      children: [
        { path: '', component: () => import('pages/Install/Index.vue') }
      ],
    },
    {
      path: '/field',
      component: () => import('layouts/fieldLayout.vue'),
    }
  ]
  
  export default routes
  