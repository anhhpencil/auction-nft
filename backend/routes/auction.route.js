const { Router } = require('express');

const { auctionController } = require('../controllers');
const validate = require('../middlewares/validate');
const { auctionValidation } = require('../validations');

const route = Router();

route.get('/', validate(auctionValidation.getAuction), auctionController.getAuction);
route.get('/bidders', validate(auctionValidation.getAuction), auctionController.getBidders);


route.post('/', validate(auctionValidation.createAuction), auctionController.createAuction);


module.exports = route;
