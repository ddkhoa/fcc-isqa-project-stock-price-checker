/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          
          //complete this one too
            assert.equal(res.status,200);
            assert.isObject(res.body.stockData, 'response should contain stockData object');
            assert.isString(res.body.stockData.stock,  'stockData object should contain the stock ticker (string)');
            assert.isNumber(res.body.stockData.price,  'stockData object should contain the price (number)')
            assert.isNumber(res.body.stockData.likes, 'like', 'stockData object should contain the number of likes (number)')
          
          done();
        });
      });
      
      test('1 stock with like (new stock)', function(done) {

        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'msft'}) // dont send like yet to get the number of like before, the local like of stock must be reset after test
        .end(function(err, res){
           
            let likeBefore = res.body.stockData.likes;

            chai.request(server)
            .get('/api/stock-prices')
            .query({stock: 'msft', like : true})    // send like, expect the number of like increase by 1
            .end(function(err, res){
                
                //complete this one too
                assert.equal(res.status,200);
                assert.isObject(res.body.stockData, 'response should contain stockData object');
                assert.isString(res.body.stockData.stock,  'stockData object should contain the stock ticker (string)');
                assert.isNumber(res.body.stockData.price,  'stockData object should contain the price (number)')
                assert.equal(res.body.stockData.likes - likeBefore, 1, `the number of likes should increase by 1. 
                you wonder if between 2 calls there are another person who send the like for this stock ?. It won't happend cause no one care about this project`);
                
                done();
            });
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'msft', like : true}) 
        .end(function(err, res){
           
            let likeBefore = res.body.stockData.likes;

            chai.request(server)
            .get('/api/stock-prices')
            .query({stock: 'msft', like : true})    // send like, expect the number of like not change
            .end(function(err, res){
                
                //complete this one too
                assert.equal(res.status,200);
                assert.isObject(res.body.stockData, 'response should contain stockData object');
                assert.isString(res.body.stockData.stock,  'stockData object should contain the stock ticker (string)');
                assert.isNumber(res.body.stockData.price,  'stockData object should contain the price (number)')
                assert.equal(res.body.stockData.likes - likeBefore, 0, `the number of likes should not change. 
                you wonder if between 2 calls there are another person who send the like for this stock ?. It won't happend cause no one care about this project`);
                
                done();
            });
        });

      });
      
      test('2 stocks', function(done) {
        
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['msft', 'goog']}) 
        .end(function(err, res){

            assert.equal(res.status,200);
            assert.isArray(res.body.stockData, 'response should contain stockData array');
            assert.isString(res.body.stockData[0].stock,'the first object of array should contain the stock ticker (string)');
            assert.isNumber(res.body.stockData[0].price,'the first object of array should contain the price (number)');
            assert.isNumber(res.body.stockData[0].rel_likes,'the first object of array should contain the difference between the likes (number)');

            assert.isString(res.body.stockData[1].stock,'the second object of array should contain the stock ticker (string)');
            assert.isNumber(res.body.stockData[1].price,'the second object of array should contain the price (number)')
            assert.isNumber(res.body.stockData[1].rel_likes,'the second object of array should contain the difference between the likes (number)')

            assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0, 'the sum of difference betweens like on both object should be 0');

            done();
        })
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['msft', 'goog'], like : true}) 
        .end(function(err, res){

            assert.equal(res.status,200);
            assert.isArray(res.body.stockData, 'response should contain stockData array');
            assert.isString(res.body.stockData[0].stock,'the first object of array should contain the stock ticker (string)');
            assert.isNumber(res.body.stockData[0].price,'the first object of array should contain the price (number)');
            assert.isNumber(res.body.stockData[0].rel_likes,'the first object of array should contain the difference between the likes (number)');

            assert.isString(res.body.stockData[1].stock,'the second object of array should contain the stock ticker (string)');
            assert.isNumber(res.body.stockData[1].price,'the second object of array should contain the price (number)')
            assert.isNumber(res.body.stockData[1].rel_likes,'the second object of array should contain the difference between the likes (number)')

            assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0, 'the sum of difference betweens like on both object should be 0');

            done();
        })
      });
      
    });

});
