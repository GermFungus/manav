const fetch = require("node-fetch");
var partials = [];
const express = require('express');
const fs = require('fs');
const request = require('request');
const xml2js = require('xml2js');
const rp = require('request-promise');
var stringSimilarity = require('string-similarity');
var MongoClient = require('mongodb').MongoClient;
const parser = new xml2js.Parser({ charkey: 'under', trim: true });
const app = express();
var country = 'canada2';
var source = '';
var prop_arr = [];
var rule_data = {};
var resp_arr = [];
var str_arr = [];
var result_arr = [];
var index_arr = [];
var main_index = [];
var count = 0;
var int_arr = ["title", "paragraph", "item"];
var sourceName = [];
var requestPartial = require('./partialfetch');
for (var i = 0; i < 100; i++) {
    str_arr.push(String(i));
    int_arr.push(i);
}



function endsWithAny(suffixes, string) {
    return suffixes.some(function(suffix) {
        return string.endsWith(suffix);
    });
}

function removeAllElements(array, elem) {
    var index = array.indexOf(elem);
    while (index > -1) {
        array.splice(index, 1);
        index = array.indexOf(elem);
    }
}
var str = [];

function iterate(source, mainkey = '', currentLevel = 1) {

    if (mainkey !== '' && mainkey !== '0' && mainkey !== '$') {
        str.push({ node: mainkey, level: currentLevel });
    }
    var s = typeof source;
    if (s == 'object') {
        for (var key in source) {

            if (source.hasOwnProperty(key)) {
                if (key !== '0' && key !== '$') {
                    str.push({ node: key, level: currentLevel });
                }
                var t = typeof source[key];
                if (t == 'object') {
                    iterate(source[key], '', currentLevel + 1);
                } else {
                    var level = str[str.length - 1].level;
                    var node = str[str.length - 1].node;

                    var check = [];

                    for (var i = 0; i < str.length; i++) {
                        if (str[i].level < level) {
                            var cvalue = 1;
                            for (k = i + 1; k < str.length; k++) {
                                if (str[k].level == str[i].level || str[k].level < str[i].level) {
                                    cvalue = 0;
                                }
                            }
                            if (cvalue > 0) {

                                if (str_arr.indexOf(str[i].node) == -1) {
                                    check.push(str[i].node);
                                }
                            }
                        }
                    }

                    check.push(node);

                    var pair = check.join('>');

                    resp_arr.push({ key: pair, value: source[key] });

                }
            }
        }
    } else {
        resp_arr.push({ key: mainkey, value: source });
    }

    return str;
}

function skeleton(source, type, isArray) {
    for (var key in source) {

        if (key !== 'xmlns' && key !== 'xmlns:xsi' && key !== 'xsi:schemaLocation' && key !== 'xsi:type') {

            if (source.hasOwnProperty(key)) {

                var t = typeof source[key];
                if (t == 'object') {
                    for (const [key1, value1] of Object.entries(source[key])) {
                        if (key1 !== '$') {

                            str = [];

                            iterate(value1, key1);
                        }
                    }

                }

            }
        }
    }

}

function check_record_rule(cond, row) {
    var check = false;
    var rightSide = '';
    if (cond.type1 === 'custom') {
        rightSide = cond.customValue;
    }
    if (cond.type1 == "property") {
        if (row[cond.typeValue1]) {
            rightSide = row[cond.typeValue1].toUpperCase();
        }
    }
    var leftSide = cond.typeValue;
    for (let [k, v] of Object.entries(row)) {

        if ((Array.isArray(v)) && (k in sourceName)) {

            v.forEach(function(obj) {
                if (leftSide in obj) {
                    switch (cond.action) {
                        case '1':
                            if (obj[leftSide] > rightSide) {
                                check = true;
                            }
                            break;
                        case '2':
                            if (obj[leftSide] < rightSide) {

                                check = true;
                            }
                            break;
                        case '3':
                            if (obj[leftSide] == rightSide) {

                                check = true;
                            }
                            break;
                        case '4':
                            if (obj[leftSide] != rightSide) {

                                check = true;
                            }
                            break;
                        case '5':
                            if (obj[leftSide].includes(rightSide)) {

                                check = true;
                            }
                            break;
                        case '6':
                            if (!(obj[leftSide].includes(rightSide))) {

                                check = true;
                            }
                            break;
                        case '7':
                            count = count + 1;

                            if (count > 1) {

                                check = true;
                            }
                            break;
                        case '8':
                            count = count + 1;

                            if (count == 1) {

                                check = true;
                            }
                            break;
                        case '9':
                            if (obj[leftSide] == '') {

                                check = true;
                            }
                            break;
                        case '10':

                            check = true;
                            break;
                        case '11':

                            check = true;
                            break;
                        case '12':

                            check = true;
                            break;
                        case '13':
                            if (obj[leftSide].startsWith(rightSide)) {

                                check = true;
                            }
                            break;
                        case '14':
                            if (obj[leftSide] == value.actionValue) {

                                check = true;
                            }
                            break;
                        default:
                            check = false;
                    }
                }
            })
        } else {
            if (k === leftSide) {
                switch (cond.action) {
                    case '1':
                        if (v > rightSide) {
                            check = true;
                        }
                        break;
                    case '2':
                        if (v < rightSide) {

                            check = true;
                        }
                        break;
                    case '3':
                        if (v == rightSide) {

                            check = true;
                        }
                        break;
                    case '4':
                        if (v != rightSide) {

                            check = true;
                        }
                        break;
                    case '5':
                        if (v.includes(rightSide)) {

                            check = true;
                        }
                        break;
                    case '6':
                        if (!(v.includes(rightSide))) {

                            check = true;
                        }
                        break;
                    case '7':
                        count = count + 1;

                        if (count > 1) {

                            check = true;
                        }
                        break;
                    case '8':
                        count = count + 1;

                        if (count == 1) {

                            check = true;
                        }
                        break;
                    case '9':
                        if (v == '') {

                            check = true;
                        }
                        break;
                    case '10':

                        check = true;
                        break;
                    case '11':

                        check = true;
                        break;
                    case '12':

                        check = true;
                        break;
                    case '13':
                        if (v.startsWith(rightSide)) {

                            check = true;
                        }
                        break;
                    case '14':
                        if (v == value.actionValue) {

                            check = true;
                        }
                        break;
                    default:
                        check = false;
                }
            }
        }
    }
    return check;
}

function check_rule(rule, data, dataP) {
    var check = false;
    if (rule.type == '') {
        check = true;
    } else if (rule.type == 'property') {
        var typevalue = rule.typeValue;
        var op = rule.action;
        var rightSide = rule.actionValue;
        if (typevalue in dataP) {
            var value = dataP[typevalue];
            if (typeof value == 'object') {
                value.forEach(function(v) {
                    switch (op) {
                        case '1':
                            if (v > rightSide) {
                                check = true;
                            }
                            break;
                        case '2':
                            if (v < rightSide) {

                                check = true;
                            }
                            break;
                        case '3':
                            if (v == rightSide) {

                                check = true;
                            }
                            break;
                        case '4':
                            if (v != rightSide) {

                                check = true;
                            }
                            break;
                        case '5':
                            if (v.includes(rightSide)) {

                                check = true;
                            }
                            break;
                        case '6':
                            if (!(v.includes(rightSide))) {
                                index_arr.push(i);
                                check = true;
                            }
                            break;
                        case '7':
                            count = count + 1;

                            if (count > 1) {

                                check = true;
                            }
                            break;
                        case '8':
                            count = count + 1;

                            if (count == 1) {

                                check = true;
                            }
                            break;
                        case '9':
                            if (v == '') {

                                check = true;
                            }
                            break;
                        case '10':

                            check = true;
                            break;
                        case '11':

                            check = true;
                            break;
                        case '12':

                            check = true;
                            break;
                        case '13':
                            if (v.startsWith(rightSide)) {

                                check = true;
                            }
                            break;
                        case '14':
                            if (v == value.actionValue) {

                                check = true;
                            }
                            break;
                        default:
                            check = false;
                    }
                })
            } else {
                switch (op) {
                    case '1':
                        if (value > rightSide) {
                            check = true;
                        }
                        break;
                    case '2':
                        if (value < rightSide) {

                            check = true;
                        }
                        break;
                    case '3':
                        if (value == rightSide) {

                            check = true;
                        }
                        break;
                    case '4':
                        if (value != rightSide) {

                            check = true;
                        }
                        break;
                    case '5':
                        if (value.includes(rightSide)) {

                            check = true;
                        }
                        break;
                    case '6':
                        if (!(value.includes(rightSide))) {

                            check = true;
                        }
                        break;
                    case '7':
                        count = count + 1;

                        if (count > 1) {

                            check = true;
                        }
                        break;
                    case '8':
                        count = count + 1;

                        if (count == 1) {

                            check = true;
                        }
                        break;
                    case '9':
                        if (value == '') {

                            check = true;
                        }
                        break;
                    case '10':

                        check = true;
                        break;
                    case '11':

                        check = true;
                        break;
                    case '12':

                        check = true;
                        break;
                    case '13':
                        if (value.startsWith(rightSide)) {

                            check = true;
                        }
                        break;
                    case '14':
                        if (value == value.actionValue) {

                            check = true;
                        }
                        break;
                    default:
                        check = false;
                }
            }
        }
    } else if (rule.type == 'sources') {
        var tag = rule.tag;
        var op = rule.action;
        var rightSide = rule.actionValue;
        for (const [k, v] of Object.entries(data)) {
            if (typeof v == 'object') {
                v.forEach(function(rrow) {
                    if (tag in rrow) {
                        switch (op) {
                            case '1':
                                if (rrow[tag] > rightSide) {
                                    check = true;
                                }
                                break;
                            case '2':
                                if (rrow[tag] < rightSide) {

                                    check = true;
                                }
                                break;
                            case '3':
                                if (rrow[tag] == rightSide) {

                                    check = true;
                                }
                                break;
                            case '4':
                                if (rrow[tag] != rightSide) {

                                    check = true;
                                }
                                break;
                            case '5':
                                if (rrow[tag].includes(rightSide)) {

                                    check = true;
                                }
                                break;
                            case '6':
                                if (!(rrow[tag].includes(rightSide))) {

                                    check = true;
                                }
                                break;
                            case '7':
                                count = count + 1;

                                if (count > 1) {

                                    check = true;
                                }
                                break;
                            case '8':
                                count = count + 1;

                                if (count == 1) {

                                    check = true;
                                }
                                break;
                            case '9':
                                if (rrow[tag] == '') {

                                    check = true;
                                }
                                break;
                            case '10':

                                check = true;
                                break;
                            case '11':

                                check = true;
                                break;
                            case '12':

                                check = true;
                                break;
                            case '13':
                                if (rrow[tag].startsWith(rightSide)) {

                                    check = true;
                                }
                                break;
                            case '14':
                                if (rrow[tag] == value.actionValue) {

                                    check = true;
                                }
                                break;
                            default:
                                check = false;
                        }
                    }
                })
            } else {
                if (k == tag) {
                    switch (op) {
                        case '1':
                            if (v > rightSide) {
                                check = true;
                            }
                            break;
                        case '2':
                            if (v < rightSide) {

                                check = true;
                            }
                            break;
                        case '3':
                            if (v == rightSide) {

                                check = true;
                            }
                            break;
                        case '4':
                            if (v != rightSide) {

                                check = true;
                            }
                            break;
                        case '5':
                            if (v.includes(rightSide)) {

                                check = true;
                            }
                            break;
                        case '6':
                            if (!(v.includes(rightSide))) {

                                check = true;
                            }
                            break;
                        case '7':
                            count = count + 1;

                            if (count > 1) {

                                check = true;
                            }
                            break;
                        case '8':
                            count = count + 1;

                            if (count == 1) {

                                check = true;
                            }
                            break;
                        case '9':
                            if (v == '') {

                                check = true;
                            }
                            break;
                        case '10':

                            check = true;
                            break;
                        case '11':

                            check = true;
                            break;
                        case '12':

                            check = true;
                            break;
                        case '13':
                            if (v.startsWith(rightSide)) {

                                check = true;
                            }
                            break;
                        case '14':
                            if (v == rightSide) {

                                check = true;
                            }
                            break;
                        default:
                            check = false;
                    }
                }
            }
        }
    }
    return check;
}

function check_position(key) {
    var t = -1;
    for (var s = 0; s < main_index.length; s++) {
        if (key < main_index[s]) {
            t = s - 1;
        }
    }
    if (t == -1) {
        t = main_index.length - 1;
    }
    return t;
}


function compressArray(original) {

    var compressed = [];
    // make a copy of the input array
    var copy = original.slice(0);

    // first loop goes over every element
    for (var i = 0; i < original.length; i++) {

        var myCount = 0;
        // loop over every element in the copy and see if it's the same
        for (var w = 0; w < copy.length; w++) {
            if (original[i] == copy[w]) {
                // increase amount of times duplicate is found
                myCount++;
                // sets item to undefined
                delete copy[w];
            }
        }

        if (myCount > 0) {
            var a = new Object();
            a.value = original[i];
            a.count = myCount;
            compressed.push(a);
        }
    }

    return compressed;
};

async function final_execution_record(row) {
    if (Object.entries(record_data).length !== 0) {
        for (let [ki, vi] of Object.entries(record_data)) {
            vi.rules.forEach(function(elem) {
                var valid1 = true;
                var Condition = 'And';
                if (elem.rule.condition.length > 0) {
                    if (valid1 && row != 0) {

                        var len = elem.rule.condition.length;

                        for (var i = 0; i < len; i++) {

                            if (Condition === 'And') {

                                valid1 = check_record_rule(elem.rule.condition[i], row) && valid1;
                            } else {

                                valid1 = check_record_rule(elem.rule.condition[i], row) || valid1;
                            }

                            Condition = elem.rule.condition[i].operator;
                        }

                        if (valid1) {
                            if (elem.rule.resultAction != '') {
                                if (elem.rule.resultAction === 'remove') {
                                    valid1 = false;
                                    resp_arr.splice(f, 1);
                                    row = 0;
                                    return false;
                                } else if (elem.rule.resultAction === 'new_record_split') {

                                    var len = elem.rule.condition.length;
                                    var spt = '';
                                    var spt1 = '';
                                    for (var i = 0; i < len; i++) {
                                        var tag = elem.rule.condition[i].tag;

                                        elem.rule.result.forEach(function(n) {

                                            if (n.tag == tag) {
                                                spt = elem.rule.condition[i].customValue;
                                                spt1 = tag
                                            }
                                        })
                                    }

                                    var arr = [];

                                    for (const [k, v] of Object.entries(row)) {
                                        if (typeof v === 'object') {
                                            v.forEach(function(r) {
                                                if (spt1 in r) {
                                                    arr = r[spt1].split(spt);
                                                }
                                            })
                                        } else {
                                            if (k == spt1) {
                                                arr = v.split(spt);
                                            }

                                        }
                                    }


                                    var alpha = 65;
                                    for (var j = 0; j < arr.length; j++) {
                                        const row1 = row;
                                        for (var [k, v] of Object.entries(row1)) {
                                            if (typeof v === 'object') {
                                                v.forEach(function(r) {
                                                    elem.rule.result.forEach(function(n) {
                                                        if (n.tag in r) {
                                                            switch (n.format) {
                                                                case '4':
                                                                    if (j > 0) {
                                                                        v = v.substring(1);
                                                                    }
                                                                    var str = String.fromCharCode(alpha) + v;
                                                                    row1[k] = str;
                                                                    alpha++;
                                                                    break;
                                                                case '5':
                                                                    var str = arr[j];
                                                                    r[n.tag] = str;
                                                                    break;
                                                            }

                                                        }
                                                    })
                                                })
                                            } else {
                                                elem.rule.result.forEach(function(n) {
                                                    if (k === n.tag) {
                                                        switch (n.format) {
                                                            case '4':
                                                                if (j > 0) {
                                                                    v = v.substring(1);
                                                                }
                                                                var str = String.fromCharCode(alpha) + v;
                                                                row1[k] = str;
                                                                alpha++;
                                                                break;
                                                            case '5':
                                                                var str = arr[j];
                                                                r[n.tag] = str;
                                                                break;
                                                        }

                                                    }
                                                })
                                            }
                                        }
                                        resp_arr.push(row1);
                                    }

                                    row = 0;
                                    resp_arr.splice(f, 1);

                                } else if (elem.rule.resultAction === 'new_record') {
                                    let result = elem.rule.result[0];
                                    if (result.type == "property") {
                                        row[`${result.typeValue}`] = "Canada GMP";

                                        row[`gmpApprovalInformation`] = row.activity;

                                    }

                                }

                            }

                        }

                    }
                }
            })
        }
    }
    MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
        var dbi = client.db("canada2");
        dbi.collection('final_canada2').insertOne(row)
    });
    return row;
}

var final_execution_normal = async(data) => {
    if (data.length) {
        data.forEach(async function(elem, i) {
            var obj = {};
            if (prop_arr.length > 0) {
                prop_arr.forEach(function(ru) {
                    var content = rule_data[ru];
                    if (content.sample) {
                        content.sample.forEach(function(property) {
                            for (const [k, v] of Object.entries(elem)) {
                                if (typeof v === 'object') {
                                    v.forEach(function(vo) {
                                        if (property in vo) {

                                            if (!obj.hasOwnProperty(ru)) {
                                                obj[ru] = [];
                                            }
                                            if (typeof obj[ru] === 'object') {
                                                obj[ru].push(vo[property]);
                                            }
                                        }
                                    })
                                } else {
                                    if (k === property) {
                                        obj[ru] = v;
                                    }
                                }

                            }

                        })
                        if (content.rules) {
                            content.rules.forEach(function(r) {
                                if (r.hasOwnProperty('concatenate')) {
                                    obj[ru] = obj[ru].join(r.concatenate);
                                }
                            })
                        }
                    } else {
                        var valid = true;
                        var Condition = 'And';
                        content.rules.forEach(function(rrow, j) {
                            var len = rrow.rule.rules.length;


                            if (valid) {

                                for (var i = 0; i < len; i++) {

                                    if (Condition === 'And') {
                                        valid = check_rule(rrow.rule.rules[i], elem, obj) && valid;
                                    } else {
                                        valid = check_rule(rrow.rule.rules[i], elem, obj) || valid;
                                    }
                                    Condition = rrow.rule.rules[i].condition;
                                }
                                if (valid) {
                                    rrow.rule.result.forEach(function(result) {
                                        if (result.type == 'custom') {
                                            if (!obj.hasOwnProperty(ru)) {
                                                obj[ru] = [];
                                            }
                                            obj[ru].push(result.customValue);
                                        } else if (result.type == 'property') {
                                            var pty = obj[result.typeValue];
                                            if (result.indexValue != '') {
                                                pty = pty[result.indexValue - 1];
                                            }
                                            if (!obj.hasOwnProperty(ru)) {
                                                obj[ru] = [];
                                            }
                                            obj[ru].push(pty);
                                        } else if (result.type == 'sources') {
                                            var tag = result.tag;
                                            for (const [k, v] of Object.entries(elem)) {
                                                if (typeof v === 'object') {
                                                    v.forEach(function(vo) {
                                                        if (tag in vo) {

                                                            if (!obj.hasOwnProperty(ru)) {
                                                                obj[ru] = [];
                                                            }
                                                            if (typeof obj[ru] === 'object') {
                                                                obj[ru].push(vo[tag]);
                                                            }
                                                        }
                                                    })
                                                } else {
                                                    if (k === tag) {
                                                        obj[ru] = v;
                                                    }
                                                }

                                            }
                                        }
                                    })
                                    valid = false;
                                } else {
                                    valid = true;
                                }
                            }
                        })

                    }
                })
                result_arr.push(obj);
            }
        })
        return (result_arr);
    }

}


async function start_execution(srawData) {

    var client = await MongoClient.connect("mongodb://localhost:27017/").catch(err => { console.error(err); });

    if (!client) {
        return;
    }
    try {
        var dbo = client.db("canada3");
        var str = [];
        if (fs.existsSync("./extractData/canada.json")) {
            let raData = fs.readFileSync("./extractData/canada.json");
            var prev_data = JSON.parse(raData);
        }
        dbo.collection("canada").insertMany(prev_data);
        delete prev_data;
        var query = async function() {
            var done = 1;
            for (var i = 1; i <= srawData.sources.length; ++i) {
                if (srawData.sources[i - 1].size == 'full') {
                    sourceName.push(srawData.sources[i - 1].name);

                    var arr = srawData.sources[i - 1].depend.split('/');
                    var request = async(url) => {
                        let resp = await fetch(url);
                        let api_data = await resp.json();
                        let api_data_new = [];
                        if (await api_data.data) {
                            api_data_new = await api_data.data;
                        } else {
                            api_data_new = await api_data;
                        }
                        api_data_new.forEach(async(dat) => {
                            dat[`${arr[1]}`] = await dat[`${arr[1]}`].toUpperCase();
                        });
                        return await api_data_new;
                    }
                    var api_dat = await request(srawData.sources[i - 1].url);

                    if (await api_dat) {
                        var write = await dbo.collection(srawData.sources[i - 1].name).insertMany(await api_dat);
                        let index = {};
                        index[`${arr[1]}`] = 1;
                        dbo.collection(srawData.sources[i - 1].name).createIndex(index);
                        delete api_dat;
                    }
                    if (await write) {
                        str.push({ $lookup: { from: `${srawData.sources[i - 1].name}`, localField: `${arr[0]}`, foreignField: `${arr[1]}`, as: `${srawData.sources[i - 1].name.toLowerCase()}` } });
                        ++done;
                    }

                }

                if (srawData.sources[i - 1].size != 'full') {
                    partials.push(srawData.sources[i - 1]);
                }
            }

            str.push({ $project: { _id: 0 } });
            str.push({ $limit: 10 });
            if (await done == srawData.sources.length) { return await str; }
        }

        var myPromise = async() => {
            var query1 = await query();
            let dataTopass = await dbo.collection('Company').aggregate(await query1).toArray();
            console.log(dataTopass.length);
            dbo.collection(srawData.sources[0].name.toLowerCase()).insertMany(await dataTopass);

            return await dataTopass;

        }

        let result = await (myPromise());
        return await result;


    } catch (err) {
        console.error(err);
    } finally {
        //  client.close();
    }



}

app.get('/common', async function(req, res) {
    res.sendStatus(200);
    var path1 = './json/' + country + '_rule.json';
    try {

        if (fs.existsSync(path1)) {
            var rawData = fs.readFileSync(path1);
            rule_data = JSON.parse(rawData);
            for (const [key, value] of Object.entries(rule_data)) {
                if (value.rules) {
                    if (prop_arr.indexOf(key) == -1) {
                        prop_arr.push(key);
                    }
                    value.rules.forEach(function(elem) {
                        if (elem.rule) {

                            elem.rule.rules.forEach(function(elem1) {
                                if (elem1.type == 'property') {
                                    if (prop_arr.indexOf(elem1.typeValue) == -1) {
                                        prop_arr.unshift(elem1.typeValue);
                                    } else {
                                        removeAllElements(prop_arr, elem1.typeValue);
                                        prop_arr.unshift(elem1.typeValue);
                                    }

                                }
                            })
                        }
                    })
                } else {
                    if (prop_arr.indexOf(key) == -1) {
                        prop_arr.push(key);
                    }
                }
            }

        }

    } catch (err) {
        console.error(err);
    }

    var path2 = './json/' + country + '_record_rule.json';
    try {
        if (fs.existsSync(path2)) {
            var record_rawData = fs.readFileSync(path2);
            record_data = JSON.parse(record_rawData);
        }
    } catch (err) {
        console.error(err);
    }



    var sourcepath = './json/' + country + '.json';
    try {
        var sdata = fs.readFileSync(sourcepath);
        var srawData = JSON.parse(sdata);
        srawData.sources.sort(function(a, b) {
            return a.order - b.order
        });

        //var slen = srawData.sources.length;
        let primaryData = await Promise.all(await start_execution(srawData));
        resp_arr = await primaryData;
        delete primaryData;
        var api_data = async() => {
            return new Promise(async(resolve, reject) => {
                let data = [];
                var i = 0;
                var intervalId = setInterval(async() => {
                    if (i === resp_arr.length) {
                        delete i;
                        clearInterval(intervalId);
                        resolve(data);
                    }
                    console.log(i, "iterator");
                    data.push(await requestPartial(resp_arr[i], partials));
                    ++i;

                }, 300);

            });
        }
        let record_data_final = await Promise.all(await api_data());

        delete resp_arr;
        console.log(await record_data_final);


    } catch (err) {
        console.error(err);
    }



});

app.listen('8083');