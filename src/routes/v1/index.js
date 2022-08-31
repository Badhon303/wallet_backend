const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const { mlmRoute } = require('../../components/mlm');
const { ethRoutes } = require('../../components/eth');
const { btcRoutes } = require('../../components/btc');
const { rolesRoute } = require('../../components/roles');
const { tokenRoutes } = require('../../components/tokens');
const { purchaseRoute } = require('../../components/purchase');
const { refpointRoute } = require('../../components/ref_point');
const { goldPointRoute } = require('../../components/gold_point');
const { privilegesRoute } = require('../../components/privileges');
const { emailTemplateRoute } = require('../../components/email');
const { termsConditionsRoute } = require('../../components/terms_and_conditions');

const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/mlm',
    route: mlmRoute,
  },
  {
    path: '/account',
    route: ethRoutes,
  },
  {
    path: '/btc',
    route: btcRoutes,
  },
  {
    path: '/roles',
    route: rolesRoute,
  },
  {
    path: '/privileges',
    route: privilegesRoute,
  },
  {
    path: '/purchase',
    route: purchaseRoute,
  },
  {
    path: '/tokens',
    route: tokenRoutes,
  },
  {
    path: '/referral-point',
    route: refpointRoute,
  },
  {
    path: '/gold-point',
    route: goldPointRoute,
  },
  {
    path: '/email-template',
    route: emailTemplateRoute,
  },
  { path: '/terms-conditions', route: termsConditionsRoute },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
