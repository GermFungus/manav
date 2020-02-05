var fetch = require("node-fetch");
var MongoClient = require('mongodb').MongoClient;

var request = async(row, partials) => {
    var reques = async(url) => {
        let resp = await fetch(url);
        let api_data = await resp.json();
        return await api_data;
    }

    let api_dat = partials.map(async partialsource => {
        let arr = partialsource.depend.split("/");
        let url1 = partialsource.url;
        let value, key;
        let dat;
        if (row[`${arr[2]}`][0]) {
            value = row[`${arr[2]}`][0][`${arr[1]}`];
            key = "inspectionNumber";
            url1 = url1.replace(key, value);
            return dat = await reques(url1);
        }
        return await dat;
    });
    let dati = (await Promise.all(api_dat));
    row = {...row, ...(dati[0]) };
    MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
        var dbi = client.db("canada3");
        dbi.collection('collected_data').insertOne(row);
    });


}

module.exports = request;