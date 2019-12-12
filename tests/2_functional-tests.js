/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function() {
  suite("GET /api/stock-prices => stockData object", function() {
    test("1 stock", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog" })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.property(
            res.body.stockData,
            "stock",
            "stock name should be a property"
          );
          assert.property(
            res.body.stockData,
            "price",
            "stock price should be a property"
          );
          assert.property(
            res.body.stockData,
            "likes",
            "stock likes should be a property"
          );
          {
            done();
          }
        });
    });

    test("1 stock with like", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog", like: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.property(
            res.body.stockData,
            "stock",
            "stock name should be a property"
          );
          assert.property(
            res.body.stockData,
            "price",
            "stock price should be a property"
          );
          assert.property(
            res.body.stockData,
            "likes",
            "stock likes should be a property"
          );
          {
            done();
          }
        });
    });

    test("1 stock with like again (ensure likes arent double counted)", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog", like: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.property(
            res.body.stockData,
            "stock",
            "stock name should be a property"
          );
          assert.property(
            res.body.stockData,
            "price",
            "stock price should be a property"
          );
          assert.property(
            res.body.stockData,
            "likes",
            "stock likes should be a property"
          );
          {
            done();
          }
        });
    });

    test("2 stocks", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["goog", "msft"] })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.isArray(res.body.stockData, "stockData should be an array");
          assert.property(
            res.body.stockData[0],
            "stock",
            "stock name should be a property"
          );
          assert.property(
            res.body.stockData[0],
            "price",
            "stock price should be a property"
          );
          assert.property(
            res.body.stockData[0],
            "rel_likes",
            "stock relative likes should be a property"
          );
          {
            done();
          }
        });
    });

    test("2 stocks with like", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["goog", "msft"], like: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.isArray(res.body.stockData, "stockData should be an array");
          assert.property(
            res.body.stockData[0],
            "stock",
            "stock name should be a property"
          );
          assert.property(
            res.body.stockData[0],
            "price",
            "stock price should be a property"
          );
          assert.property(
            res.body.stockData[0],
            "rel_likes",
            "stock relative likes should be a property"
          );
          {
            done();
          }
        });
    });
  });
});
