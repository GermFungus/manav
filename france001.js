//import packages
var express = require('express');
var request = require('request');
var fs = require('fs');
const lineReader = require('line-reader');
//assign varibale
var app = express();
//custom array to store data
var compo_array = [];
var cis_array = [];
var cis_cip = [];
//send request to route on browser
var property_name = {};
app.get('/france001', function(req, res) {

    lineReader.eachLine("./COMPO.txt", function(line, last) {
        var arr = line.split('\t');
        var cis_code = arr[0];
        var sub_dosage = arr[4].split(' ');
        var sub_dosage1 = arr[5].split(' ');

        if (cis_code in compo_array) {
            compo_array[cis_code].push({
                'cis_code': arr[0],
                'dosage_form': arr[1],
                'substance_name': arr[3],
                'substance_dosage': sub_dosage[0],
                'substance_unit': sub_dosage[1],
                'quantity_need': sub_dosage1[0],
                'quantity_unit': sub_dosage1[1]
            })
        } else {
            compo_array[cis_code] = [];
            compo_array[cis_code]['cis_code'] = arr[0];
            compo_array[cis_code]['dosage_form'] = arr[1];
            compo_array[cis_code]['substance_name'] = arr[3];
            compo_array[cis_code]['substance_dosage'] = sub_dosage[0];
            compo_array[cis_code]['substance_unit'] = sub_dosage[1];
            compo_array[cis_code]['quantity_need'] = sub_dosage1[0];
            compo_array[cis_code]['quantity_unit'] = sub_dosage1[1];
        }

        if (last) {
            //console.log(compo_array);
            return false;
        }
    });
    lineReader.eachLine("./CIS.txt", function(line, last) {
        let arr = line.split('\t');
        let cis = arr[0];
        if (cis in cis_array) {
            cis_array[cis].push({
                cis_code: arr[0],
                company_name: arr[1],
                form: arr[2],
                route_adminstration: arr[3],
                marketing_auth: arr[4],
                auth_procedure: arr[5],
                marketing_status: arr[6]
            });
        } else {
            cis_array[cis] = [];
            cis_array[cis].push({
                cis_code: arr[0],
                company_name: arr[1],
                form: arr[2],
                route_adminstration: arr[3],
                marketing_auth: arr[4],
                auth_procedure: arr[5],
                marketing_status: arr[6]
            });
        }
        if (last) {
            console.log(cis_array);
            return false;
        }
    });

    lineReader.eachLine("./CIS_CIP.txt", function(line, last) {
        let arr = line.split('\t');
        let cis = arr[0];
        if (cis in cis_cip) {
            cis_cip[cis].push({
                cis_code: arr[0],
                cip_code7: arr[1],
                packaging_description: arr[2],
                adminstration_status: arr[3],
                marketing_status: arr[4],
                dateOfDeclaration: arr[5],
                cip_code13: arr[6]

            });
        } else {
            cis_cip[cis] = [];
            cis_cip[cis].push({
                cis_code: arr[0],
                cip_code7: arr[1],
                packaging_description: arr[2],
                adminstration_status: arr[3],
                marketing_status: arr[4],
                dateOfDeclaration: arr[5],
                cip_code13: arr[6]
            });
        }
        if (last) {
            console.log(cis_array);
            return false;
        }
    });
    res.sendStatus(200);
    res.end();
});

app.listen('8081')
exports = module.exports = app;