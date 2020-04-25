const connection = require("./connection");

module.exports = {

    saveStock: async function (params) {
        const client = connection.getClient();
        const stockCollection = client.db("stock").collection("stocks");
        const response = await stockCollection.insertOne(params);
        const doc = response.ops[0];
        return doc;
    },

    getByName: async function (stock) {
        const client = connection.getClient();
        const stockCollection = client.db("stock").collection("stocks");
        const doc = await stockCollection.findOne({ stock })
        return doc;
    },

    updateStock: async function (params) {

        const { find, update } = params;
        const client = connection.getClient();
        const stockCollection = client.db("stock").collection("stocks");
        const response = await stockCollection.findOneAndUpdate(find, update);
        return response;
    },
}