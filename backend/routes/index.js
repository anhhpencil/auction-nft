const express = require('express');
const auctionRoute = require('./auction.route');


const router = express.Router();

const defaultRoutes = [
    {
        path: '/auction',
        route: auctionRoute,
    },
];

defaultRoutes.forEach((route) => {

    router.use(route.path, route.route);
});

module.exports = router;
