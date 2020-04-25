/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';
const stockController = require("../controller/stockController");

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){

        const params = {
            stock : req.query.stock,
            like : req.query.like,
            ip : req.ip
        };
      
        const result = await stockController.handle(params);
        res.json(result);
    });
    
};
