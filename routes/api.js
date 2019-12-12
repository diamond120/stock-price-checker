/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
const request = require("request");

module.exports = function(app) {
  const CONNECTION_STRING = process.env.DB;

  const client = new MongoClient(CONNECTION_STRING, { useNewUrlParser: true });
  const dbName = "stocks";

  app.route("/api/stock-prices").get(function(req, res) {
    client.connect(function(err) {
      if (err) throw err;
      const db = client.db(dbName);
      const stocks = db.collection("stocks");

      let stock = req.query.stock;
      let like = req.query.like;

      if (typeof stock === "string") {
        request(
          `https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`,
          { json: true },
          (err, result, body) => {
            if (err) throw err;
            stocks.findOne({ symbol: stock }, (err, result) => {
              if (err) throw err;
              if (result === null) {
                if (like === true) {
                  stocks.insertOne({
                    symbol: stock,
                    likes: 1,
                    liked: [req.connection.remoteAddress]
                  });
                  res.json({
                    stockData: {
                      stock: stock,
                      price: body.latestPrice,
                      likes: 1
                    }
                  });
                } else {
                  stocks.insertOne({ symbol: stock, likes: 0, liked: [] });
                  res.json({
                    stockData: {
                      stock: stock,
                      price: body.latestPrice,
                      likes: 0
                    }
                  });
                }
              } else {
                if (result.liked.indexOf(req.connection.remoteAddress) === -1) {
                  stocks.updateOne(
                    { symbol: stock },
                    {
                      $inc: { likes: 1 },
                      $push: { liked: req.connection.remoteAddress }
                    }
                  );
                  res.json({
                    stockData: {
                      stock: stock,
                      price: body.latestPrice,
                      likes: result.likes + 1
                    }
                  });
                } else {
                  res.json({
                    stockData: {
                      stock: stock,
                      price: body.latestPrice,
                      likes: result.likes
                    }
                  });
                }
              }
            });
          }
        );
      } //end of just 1 stock
      if (typeof stock === "object") {
        let stock1 = { stock: stock[0] };
        let stock2 = { stock: stock[1] };
        request(
          `https://repeated-alpaca.glitch.me/v1/stock/${stock[0]}/quote`,
          { json: true },
          (err, result, body) => {
            if (err) throw err;
            stock1.price = body.latestPrice;
            request(
              `https://repeated-alpaca.glitch.me/v1/stock/${stock[1]}/quote`,
              { json: true },
              (err, result, body) => {
                if (err) throw err;
                stock2.price = body.latestPrice;

                stocks.findOne({ symbol: stock1.stock }, (err, result) => {
                  if (err) throw err;
                  if (result === null) {
                    if (like === true) {
                      stocks.insertOne({
                        symbol: stock1.stock,
                        likes: 1,
                        liked: [req.connection.remoteAddress]
                      });
                      stock1.likes = 1;

                      stocks.findOne(
                        { symbol: stock2.stock },
                        (err, result) => {
                          if (result === null) {
                            stocks.insertOne({
                              symbol: stock2.stock,
                              likes: 1,
                              liked: [req.connection.remoteAddress]
                            });
                            stock2.likes = 1;
                            console.log(
                              "stock1 is not in database stock 2 is not in database and like is true"
                            );
                            res.json({
                              stockData: [
                                {
                                  stock: stock1.stock,
                                  price: stock1.price,
                                  rel_likes: stock1.likes - stock2.likes
                                },
                                {
                                  stock: stock2.stock,
                                  price: stock2.price,
                                  rel_likes: stock2.likes - stock1.likes
                                }
                              ]
                            });
                          } else {
                            if (
                              result.liked.indexOf(
                                req.connection.remoteAddress
                              ) === -1
                            ) {
                              stocks.updateOne(
                                { symbol: stock2.stock },
                                {
                                  $inc: { likes: 1 },
                                  $push: { liked: req.connection.remoteAddress }
                                }
                              );
                              stock2.likes = result.likes + 1;
                              console.log(
                                "stock1 is not in database stock 2 is in database and like is true"
                              );
                              res.json({
                                stockData: [
                                  {
                                    stock: stock1.stock,
                                    price: stock1.price,
                                    rel_likes: stock1.likes - stock2.likes
                                  },
                                  {
                                    stock: stock2.stock,
                                    price: stock2.price,
                                    rel_likes: stock2.likes - stock1.likes
                                  }
                                ]
                              });
                            } else {
                              stock2.likes = result.likes;
                              console.log(
                                "stock1 is not in database stock 2 is in database and like is true"
                              );
                              res.json({
                                stockData: [
                                  {
                                    stock: stock1.stock,
                                    price: stock1.price,
                                    rel_likes: stock1.likes - stock2.likes
                                  },
                                  {
                                    stock: stock2.stock,
                                    price: stock2.price,
                                    rel_likes: stock2.likes - stock1.likes
                                  }
                                ]
                              });
                            }
                          }
                        }
                      );
                    } else {
                      //like is not true
                      stocks.insertOne({
                        symbol: stock1.stock,
                        likes: 0,
                        liked: []
                      });
                      stock1.likes = 0;

                      stocks.findOne(
                        { symbol: stock2.stock },
                        (err, result) => {
                          if (result === null) {
                            stocks.insertOne({
                              symbol: stock2.stock,
                              likes: 0,
                              liked: []
                            });
                            stock2.likes = 0;
                            console.log(
                              "stock1 is not in database stock 2 is not in database and like is false"
                            );
                            res.json({
                              stockData: [
                                {
                                  stock: stock1.stock,
                                  price: stock1.price,
                                  rel_likes: stock1.likes - stock2.likes
                                },
                                {
                                  stock: stock2.stock,
                                  price: stock2.price,
                                  rel_likes: stock2.likes - stock1.likes
                                }
                              ]
                            });
                          } else {
                            stock2.likes = result.likes;
                            console.log(
                              "stock1 is not in database stock 2 is in database and like is false"
                            );
                            res.json({
                              stockData: [
                                {
                                  stock: stock1.stock,
                                  price: stock1.price,
                                  rel_likes: stock1.likes - stock2.likes
                                },
                                {
                                  stock: stock2.stock,
                                  price: stock2.price,
                                  rel_likes: stock2.likes - stock1.likes
                                }
                              ]
                            });
                          }
                        }
                      );
                    }
                  } else {
                    //first stock is in database
                    if (like === true) {
                      if (
                        result.liked.indexOf(req.connection.remoteAddress) ===
                        -1
                      ) {
                        stocks.updateOne(
                          { symbol: stock1.stock },
                          {
                            $inc: { likes: 1 },
                            $push: { liked: req.connection.remoteAddress }
                          }
                        );
                        stock1.likes = result.likes + 1;
                      } else {
                        stock1.likes = result.likes;
                      }

                      stocks.findOne(
                        { symbol: stock2.stock },
                        (err, result) => {
                          if (result === null) {
                            stocks.insertOne({
                              symbol: stock2.stock,
                              likes: 1,
                              liked: [req.connection.remoteAddress]
                            });
                            stock2.likes = 1;
                            console.log(
                              "stock 1 is in database stock 2 is not in database and like is true"
                            );
                            res.json({
                              stockData: [
                                {
                                  stock: stock1.stock,
                                  price: stock1.price,
                                  rel_likes: stock1.likes - stock2.likes
                                },
                                {
                                  stock: stock2.stock,
                                  price: stock2.price,
                                  rel_likes: stock2.likes - stock1.likes
                                }
                              ]
                            });
                          } else {
                            if (
                              result.liked.indexOf(
                                req.connection.remoteAddress
                              ) === -1
                            ) {
                              stocks.updateOne(
                                { symbol: stock2.stock },
                                {
                                  $inc: { likes: 1 },
                                  $push: { liked: req.connection.remoteAddress }
                                }
                              );
                              stock2.likes = result.likes + 1;
                              console.log(
                                "stock 1 is in database stock 2 is in database and like is true"
                              );
                              res.json({
                                stockData: [
                                  {
                                    stock: stock1.stock,
                                    price: stock1.price,
                                    rel_likes: stock1.likes - stock2.likes
                                  },
                                  {
                                    stock: stock2.stock,
                                    price: stock2.price,
                                    rel_likes: stock2.likes - stock1.likes
                                  }
                                ]
                              });
                            } else {
                              stock2.likes = result.likes;
                              console.log(
                                "stock 1 is in database stock 2 is in database and like is true"
                              );
                              res.json({
                                stockData: [
                                  {
                                    stock: stock1.stock,
                                    price: stock1.price,
                                    rel_likes: stock1.likes - stock2.likes
                                  },
                                  {
                                    stock: stock2.stock,
                                    price: stock2.price,
                                    rel_likes: stock2.likes - stock1.likes
                                  }
                                ]
                              });
                            }
                          }
                        }
                      );
                    } else {
                      //like is not true

                      stock1.likes = 0;

                      stocks.findOne(
                        { symbol: stock2.stock },
                        (err, result) => {
                          if (result === null) {
                            stocks.insertOne({
                              symbol: stock2.stock,
                              likes: 0,
                              liked: []
                            });
                            stock2.likes = 0;
                            console.log(
                              "stock 1 is in database stock 2 is not in database and like is false"
                            );
                            res.json({
                              stockData: [
                                {
                                  stock: stock1.stock,
                                  price: stock1.price,
                                  rel_likes: stock1.likes - stock2.likes
                                },
                                {
                                  stock: stock2.stock,
                                  price: stock2.price,
                                  rel_likes: stock2.likes - stock1.likes
                                }
                              ]
                            });
                          } else {
                            stock2.likes = result.likes;

                            console.log(
                              "stock 1 is in database stock 2 is in database and like is false"
                            );
                            res.json({
                              stockData: [
                                {
                                  stock: stock1.stock,
                                  price: stock1.price,
                                  rel_likes: stock1.likes - stock2.likes
                                },
                                {
                                  stock: stock2.stock,
                                  price: stock2.price,
                                  rel_likes: stock2.likes - stock1.likes
                                }
                              ]
                            });
                          }
                        }
                      );
                    }
                  }
                });
              }
            );
          }
        );
      }
    });
  });
};

//this is the response from the api I use for each stock:
/* {
  symbol: 'GOOG',
  companyName: 'Alphabet, Inc.',
  primaryExchange: 'NASDAQ',
  calculationPrice: 'close',
  open: 1305.5,
  openTime: 1575037800675,
  close: 1304.96,
  closeTime: 1575050400593,
  high: 1310.205,
  low: 1303.97,
  latestPrice: 1304.96,
  latestSource: 'Close',
  latestTime: 'November 29, 2019',
  latestUpdate: 1575050400593,
  latestVolume: 586981,
  iexRealtimePrice: null,
  iexRealtimeSize: null,
  iexLastUpdated: null,
  delayedPrice: 1304.98,
  delayedPriceTime: 1575064744663,
  extendedPrice: 1304.98,
  extendedChange: 0.02,
  extendedChangePercent: 0.00002,
  extendedPriceTime: 1575063959626,
  previousClose: 1312.99,
  previousVolume: 996329,
  change: -8.03,
  changePercent: -0.00612,
  volume: 586981,
  iexMarketPercent: null,
  iexVolume: null,
  avgTotalVolume: 1298042,
  iexBidPrice: null,
  iexBidSize: null,
  iexAskPrice: null,
  iexAskSize: null,
  marketCap: 900061296689,
  peRatio: 27.78,
  week52High: 1335.52,
  week52Low: 970.11,
  ytdChange: 0.24168,
  lastTradeTime: 1575053357395,
  isUSMarketOpen: false
}
*/
