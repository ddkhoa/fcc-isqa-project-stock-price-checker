const axios = require("axios");
const Stock = require("../datalayer/Stock");

module.exports = {

    handle: async function (params) {

        if (!params.stock) {
            return "Missing stock ticker";
        }

        if (typeof params.stock == "string") {
            return this.handleOneStock(params);
        }

        return this.handleTwoStocks(params);
    },

    handleOneStock: async function (params) {

        try {

            const { stock, like, ip } = params;

            // get stock price from API
            const stockPrice = await getStockPrice(stock);

            // get stock like info from database
            const stockInfo = await Stock.getByName(stock);

            if (!stockInfo) {

                // stock has not been saved in db yet, save it to keep track
                const likes = like == "true" ? [ip] : [];
                const req = {
                    stock,
                    likes: likes
                }
                await Stock.saveStock(req);

                return {
                    stockData: {
                        stock,
                        likes: likes.length,
                        price: stockPrice
                    }
                }
            }

            if (stockInfo.likes.includes(ip) || like != "true") {

                // if the stock likes include the request IP or like is false
                // return the current information
                return {
                    stockData: {
                        stock,
                        likes: stockInfo.likes.length,
                        price: stockPrice
                    }
                }
            }

            // the stock likes doesn't include the request IP and like is true
            // update the info and return the new information
            const req = {
                find: { stock },
                update: { $push: { likes: ip } }
            }

            await Stock.updateStock(req);

            return {
                stockData: {
                    stock,
                    likes: stockInfo.likes + 1,
                    price: stockPrice
                }
            }

        } catch (error) {

            if (error.message == "Invalid symbol" || error.message == "Not found") {

                return "Invalid stock";
            }

            return "Error server";
        }

    },

    handleTwoStocks: async function (params) {

        const { stock, like, ip } = params;
        const firstResult = await this.handleOneStock({ stock: stock[0], like, ip });
        const secondResult = await this.handleOneStock({ stock: stock[1], like, ip });

        if (typeof firstResult == "string") {

            return firstResult;
        }

        if (typeof secondResult == "string") {

            return secondResult;
        }

        const rel_likes = firstResult.stockData.likes - secondResult.stockData.likes;

        const result = [
            {
                stock: firstResult.stockData.stock,
                price: firstResult.stockData.price,
                rel_likes: rel_likes
            },
            {
                stock: secondResult.stockData.stock,
                price: secondResult.stockData.price,
                rel_likes: rel_likes * -1
            },
        ];

        return { stockData: result };
    }
}

async function getStockPrice(stock) {

    try {

        const URL = `https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`;

        const response = await axios.get(URL);
        const data = response.data;

        if (data == "Not found") {

            // cannot find information about stock
            throw new Error("Not found");
        }

        if (data == "Invalid symbol") {

            // stock name contains invalid symbol
            throw new Error("Invalid symbol");
        }

        return data.latestPrice;

    } catch (error) {

        console.log("Error when get stock price at " + URL);
        console.log(error.message);
        throw (error);
    }
} 