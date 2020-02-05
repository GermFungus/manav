var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');

MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
    var dbi = client.db("canada2");
    var data = dbi.collection('final_canada2').find({}).project({
        _id: 0,
        numbersOfAis: 1,
        activeIngredientName: 1,
        dose: 1,
        productID: 1,
        sanitizedRegiestrationNumber: 1,
        productName: 1,
        licenseHolderSponser: 1,

        companyCode: 1,
        facilityAddress: 1,
        countryOfOrigin: 1,
        format: 1,
        packagingID: 1,
        unit: 1,
        type: 1,
        packagingInformation: 1,
        regulatoryClass: 1,
        marketingStatus: 1,
        registrationDate: 1,
        sanitizedIndication: 1,
        atcCode: 1,
        pharmaceuticalStd: 1,
        regulatoryRoute: 1,
        currentMarket: 1,
        nature: 1,
        drugCluster: 1,
        sanitizedRouteOfAdministration: 1,
        className: 1,

        primaryPackageQuantity: 1,
        unitOfDose: 1,
        quantityNeedToTake: 1,
        qunatityUnit: 1,
        gmpCompliance: 1,
        gmpApprovalInformation: 1
    });
    data.forEach((con) => {
        //var result = [];

        //result.push(con);
        fs.appendFile('mynewfile3.json', JSON.stringify(con) + ",", (err) => {
            console.log(err);
        });
    })
});