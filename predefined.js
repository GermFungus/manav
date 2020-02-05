const express = require('express');
const fs = require('fs');
const request = require('request');
const bodyParser = require('body-parser');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ charkey: 'under', trim: true });
const builder = new xml2js.Builder();
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extend: true }))
app.use(express.static(__dirname + '/public'));


app.get('/predefined', function(req, res) {
    let rawdata = fs.readFileSync('./models/predefined.json');
    let predefined = JSON.parse(rawdata);
    const pre_array = [];
    for (var key in predefined) {
        if (typeof predefined[key] === 'object') {
            var obj = predefined[key];
            for (var prop in obj) {
                var arr = obj[prop].split(';');
                pre_array.push(arr[0]);
            }
        } else {
            var arr = predefined[key].split(';');
            pre_array.push(arr[0]);
        }
    }
    const sendData = { pre_array }
    res.render('predefined', sendData);
})

app.post('/checkfile', function(req, res) {
    var country = req.body.country;
    const path = './json/' + country + '.json';
    try {
        if (fs.existsSync(path)) {
            fs.readFile(path, function(err, content) {
                res.send(content);
            })
        } else {
            res.send('0');
        }
    } catch (err) {
        console.error(err)
    }
})

app.post('/checkfile-table', function(req, res) {
    var country = req.body.country;
    const path = './json/' + country + '_table.json';
    try {
        if (fs.existsSync(path)) {
            fs.readFile(path, function(err, content) {
                res.send(content);
            })
        } else {
            res.send('0');
        }
    } catch (err) {
        console.error(err)
    }
})

app.post('/submit-form', function(req, res) {
    const data1 = req.body.finaldata;
    const data = JSON.parse(data1);
    const country = data.country;
    const path = './json/' + country + '.json';
    try {
        var createStream = fs.createWriteStream(path);
        createStream.write(data1);
        createStream.end();
    } catch (err) {
        console.error(err)
    }
    res.send();
})

app.get('/tables', function(req, res) {
    res.render('tables');
})

app.post('/gprop', function(req, res) {
    let rawdata = fs.readFileSync('./models/predefined.json');
    let predefined = JSON.parse(rawdata);
    const pre_array = [];

    for (var key in predefined) {
        if (typeof predefined[key] === 'object') {
            var obj = predefined[key];
            for (var prop in obj) {
                var arr = obj[prop];
                pre_array.push(arr);
            }
        } else {
            var arr = predefined[key];
            pre_array.push(arr);
        }
    }

    var country = req.body.country;
    const path = './json/' + country + '.json';
    let content = fs.readFileSync(path);
    var data = JSON.parse(content);
    var property = data.property;
    property.forEach(function(n2) {
        pre_array.push(n2);
    })


    res.send(pre_array);
})

app.post('/submit-table', function(req, res) {
    let rawdata = fs.readFileSync('./models/predefined.json');
    let predefined = JSON.parse(rawdata);
    const pre_array = [];

    for (var key in predefined) {
        if (typeof predefined[key] === 'object') {
            var obj = predefined[key];
            for (var prop in obj) {
                var arr = obj[prop];
                pre_array.push(arr);
            }
        } else {
            var arr = predefined[key];
            pre_array.push(arr);
        }
    }
    var new_array = [];
    var new_array1 = [];
    pre_array.forEach(function(n1) {
        var arr = n1.split(';');
        var str = arr[0];
        new_array[str] = [];
        new_array1[str] = [];
        arr.shift();
        if (arr.length > 0) {
            arr.forEach(function(n2) {
                new_array[str].push(n2);
                new_array1[str].push(n2);
            })
        }
    })


    const data1 = req.body.finaldata;
    const data = JSON.parse(data1);
    var inner_relation = [];
    data.realtions.forEach(function(so) {
        if (so.schema_type == 'embeded') {
            inner_relation.unshift(so);
        } else {
            inner_relation.push(so);
        }
    })

    const country = data.country;
    const schema_type = data.schema_type;
    const path = './json/' + country + '_table.json';
    const path1 = './models/' + country + '_schema.js';
    try {
        var createStream = fs.createWriteStream(path);
        createStream.write(data1);
        createStream.end();
        var createStream = fs.createWriteStream(path1);
        createStream.write("var mongoose = require('mongoose');\r\nvar Schema = mongoose.Schema;");
        var name = [];

        inner_relation.forEach(function(elem) {
            name.push(elem.name.replace(/ /g, ''));
            createStream.write("\r\n\r\nvar " + elem.name.replace(/ /g, '') + "Schema = new Schema({\r\n");

            elem.prop_structure.forEach(function(elem1) {
                var arr = new_array[elem1];
                if (arr.length > 0) {
                    if (arr.indexOf('required') !== -1) {
                        createStream.write(elem1 + ": { value: {type: mongoose.Mixed, required: true}, ");
                    } else {
                        createStream.write(elem1 + ": {value: mongoose.Mixed, ");
                    }
                    var last = arr.pop();
                    let i = arr.length - 1;
                    let k = 0;
                    arr.forEach(function(n3) {
                        if (n3 != "required") {
                            if (k == i) {
                                createStream.write(n3 + ": mongoose.Mixed, ");
                            } else {
                                createStream.write(n3 + ": mongoose.Mixed, ");
                            }
                        }
                        k = k + 1;
                    })
                    if (last != "required") {
                        createStream.write(last + ": mongoose.Mixed ");
                    }
                    createStream.write("},\r\n")
                } else {
                    createStream.write(elem1 + ": mongoose.Mixed,\r\n");
                }

            })

            if (elem.relation.length > 0) {
                elem.relation.forEach(function(n4) {
                    if (n4.table_name != '' && n4.table_property != '') {
                        var table_property = n4.table_property;
                        var arr = new_array1[table_property];

                        if (arr.length > 0) {
                            if (arr.indexOf('required') !== -1) {
                                createStream.write(table_property + ": { value: {type: mongoose.Mixed, required: true}, ");
                            } else {
                                createStream.write(table_property + ": {value: mongoose.Mixed, ");
                            }
                            var last = arr.pop();
                            let i = arr.length - 1;
                            let k = 0;
                            arr.forEach(function(n3) {
                                if (n3 != "required") {
                                    if (k == i) {
                                        createStream.write(n3 + ": mongoose.Mixed");
                                    } else {
                                        createStream.write(n3 + ": mongoose.Mixed, ");
                                    }
                                }
                                k = k + 1;
                            })
                            if (last != "required") {
                                createStream.write(", " + last + ": mongoose.Mixed ");
                            }
                            createStream.write("},\r\n")
                        } else {
                            createStream.write(table_property + ": mongoose.Mixed,\r\n");
                        }
                    } else if (n4.table_name != '') {
                        createStream.write(n4.table_name.replace(/ /g, '') + "ID: {type: mongoose.Schema.Types.ObjectId, ref: '" + n4.table_name.replace(/ /g, '') + "Schema'},\r\n");
                    }

                })
            }
            data.realtions.forEach(function(st) {
                if (st.schema_type == "embeded") {
                    if (st.schema_type_table.replace(/ /g, '') == elem.name.replace(/ /g, '')) {
                        createStream.write(st.name.replace(/ /g, '') + ": " + st.name.replace(/ /g, '') + "Schema,\r\n");
                    }
                }
            })

            createStream.write("Lastupdate: {type: Date, default: Date.now},\r\n");
            createStream.write("Created: {type: Date, default: Date.now},\r\n");
            createStream.write("Delete: Boolean\r\n");
            createStream.write("})\r\n");
            createStream.write("\r\nconst " + elem.name.replace(/ /g, '') + "S = mongoose.model('" + elem.name.replace(/ /g, '') + "Schema', " + elem.name.replace(/ /g, '') + "Schema);");
        })
        createStream.write("\r\n");
        createStream.write("module.exports = { ");
        var last = name.pop();
        name.forEach(function(elem2) {
            createStream.write(elem2 + ": " + elem2 + "S, ");
        })
        createStream.write(last + ": " + last + "S ");
        createStream.write("}");
        createStream.end();

    } catch (err) {
        console.error(err)
    }
    res.send(data);
})

app.get('/ways', function(req, res) {
    res.render('ways');
})

app.post('/get-source', function(req, res) {
    var country = req.body.country;
    const path = './json/' + country + '.json';
    try {
        let rawdata = fs.readFileSync(path);
        let content = JSON.parse(rawdata);
        res.send(content.sources);
    } catch (err) {
        console.error(err)
    }
})

function skeleton(source, isArray) {
    var o = Array.isArray(source) ? [] : {};
    for (var key in source) {
        if (key !== 'xmlns' && key !== 'xmlns:xsi' && key !== 'xsi:schemaLocation' && key !== 'xsi:type') {
            if (source.hasOwnProperty(key)) {
                var t = typeof source[key];
                o[key] = t == 'object' ? skeleton(source[key]) : { string: '', number: 0, boolean: false }[t];
            }
        }
    }
    return o;
}

app.post('/get-api-response', function(req, res) {
    var arr = JSON.parse(req.body.findalData);
    var url = arr.sourceurl;
    var responsetype = arr.responsetype;
    for (const [key, value] of Object.entries(arr)) {
        if (key != 'sourceurl' && key != 'responsetype') {
            console.log(key, value);

            url = url.replace(key, value);
            console.log(url);
        }
    }
    var resp = '';
    var xml = '';
    request(url, function(err, response, html) {
        if (err) throw err
        if (responsetype.toLowerCase() == 'xml' || responsetype.toLowerCase() == 'html') {
            parser.parseString(response.body, function(err, result) {
                if (err) throw err
                resp = skeleton(result);
                xml = builder.buildObject(resp);
                res.send(xml);
            })
        } else if (responsetype.toLowerCase() == 'json') {
            var pos = response.body.substring(0, 1);
            if (pos === '[') {
                var result = JSON.parse(response.body);
                resp = skeleton(result);
                resp.forEach(function(elem) {
                    xml = builder.buildObject(elem);

                })
                res.send(xml);
            } else {
                var result = JSON.parse(response.body);
                resp = skeleton(result);
                xml = builder.buildObject(resp);
                res.send(xml);
            }

        }

    })

})

app.post('/gpropw', function(req, res) {
    let rawdata = fs.readFileSync('./models/predefined.json');
    let predefined = JSON.parse(rawdata);
    const pre_array = [];

    for (var key in predefined) {
        if (typeof predefined[key] === 'object') {
            var obj = predefined[key];
            for (var prop in obj) {
                var arr = obj[prop];
                pre_array.push(arr);
            }
        } else {
            var arr = predefined[key];
            pre_array.push(arr);
        }
    }

    var country = req.body.country;
    const path = './json/' + country + '.json';
    let content = fs.readFileSync(path);
    var data = JSON.parse(content);
    var property = data.property;
    property.forEach(function(n2) {
        pre_array.push(n2);
    })

    var assigend_array = [];
    const path1 = './json/' + country + '_rule.json';
    try {
        if (fs.existsSync(path1)) {
            let content = fs.readFileSync(path1);
            assigend_array = JSON.parse(content);
            console.log(assigend_array);
        }
    } catch (err) {
        console.error(err)
    }

    res.send({ data: pre_array, assigend_array: assigend_array });
})

app.post('/make-config', function(req, res) {
    var country = req.body.country;
    var setporp = JSON.parse(req.body.setproperty);
    console.log(setporp);
    const path = './json/' + country + '_rule.json';
    try {
        if (fs.existsSync(path)) {
            fs.readFile(path, function(err, content) {
                if (err) throw (err)
                if (content != '' && content != '{}') {
                    var json = JSON.parse(content);

                    for (const [key, value] of Object.entries(setporp)) {
                        json[key] = value;
                    }

                    var createStream = fs.createWriteStream(path);
                    createStream.write(JSON.stringify(json));
                    createStream.end();
                } else {
                    var createStream = fs.createWriteStream(path);
                    createStream.write(JSON.stringify(setporp));
                    createStream.end();
                }

            })
        } else {
            var createStream = fs.createWriteStream(path);
            createStream.write(JSON.stringify(setporp));
            createStream.end();

        }
    } catch (err) {
        console.error(err)
    }

    res.send();


})

app.post('/make-config-record', function(req, res) {
    var country = req.body.country;
    var setporp = JSON.parse(req.body.setproperty);
    console.log(setporp);
    const path = './json/' + country + '_record_rule.json';
    try {
        if (fs.existsSync(path)) {
            fs.readFile(path, function(err, content) {
                if (err) throw (err)
                if (content != '' && content != '{}') {
                    var json = JSON.parse(content);

                    for (const [key, value] of Object.entries(setporp)) {
                        json[key] = value;
                    }

                    var createStream = fs.createWriteStream(path);
                    createStream.write(JSON.stringify(json));
                    createStream.end();
                } else {
                    var createStream = fs.createWriteStream(path);
                    createStream.write(JSON.stringify(setporp));
                    createStream.end();
                }

            })
        } else {
            var createStream = fs.createWriteStream(path);
            createStream.write(JSON.stringify(setporp));
            createStream.end();

        }
    } catch (err) {
        console.error(err)
    }

    res.send();


})

app.post('/get-record-rule', function(req, res) {
    var country = req.body.country;
    const path = './json/' + country + '_record_rule.json';
    try {
        if (fs.existsSync(path)) {
            fs.readFile(path, function(err, content) {
                if (err) throw (err)
                if (content != '' && content != '{}') {
                    var json = JSON.parse(content);

                    if (json[req.body.source]) {
                        res.send(json[req.body.source]);
                    } else {
                        res.send('0');
                    }

                } else {
                    res.send('0');
                }

            })
        } else {
            res.send('0');

        }
    } catch (err) {
        console.error(err)
    }
})

app.post('/get-input', function(req, res) {
    var country = req.body.country;
    const path = './json/' + country + '_rule.json';
    try {
        if (fs.existsSync(path)) {
            fs.readFile(path, function(err, content) {
                var json = JSON.parse(content);
                res.send(json[req.body.key]);
            })
        }
    } catch (err) {
        console.error(err)
    }


})

app.post('/remove-key', function(req, res) {
    var country = req.body.country;
    const path = './json/' + country + '_rule.json';
    try {
        if (fs.existsSync(path)) {
            fs.readFile(path, function(err, content) {
                var json = JSON.parse(content);
                delete json[req.body.key];
                var createStream = fs.createWriteStream(path);
                createStream.write(JSON.stringify(json));
                createStream.end();
                res.send();
            })
        }
    } catch (err) {
        console.error(err)
    }

})

app.get('/overall', function(req, res) {
    res.render('overall');
})

app.get('/final', function(req, res) {
    res.render('final');
})

app.listen('8081')