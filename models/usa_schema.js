var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SecondTableSchema = new Schema({
format: {value: mongoose.Mixed, sourcetype: mongoose.Mixed, sourcelink: mongoose.Mixed },
distributed_gmpCompliance: mongoose.Mixed,
distributed_gmpApprovalInformation: mongoose.Mixed,
productID: {value: mongoose.Mixed, sourcetype: mongoose.Mixed, sourcelink: mongoose.Mixed },
Lastupdate: {type: Date, default: Date.now},
Created: {type: Date, default: Date.now},
Delete: Boolean
})

const SecondTableS = mongoose.model('SecondTableSchema', SecondTableSchema);

var MainTableSchema = new Schema({
productID: {value: mongoose.Mixed, sourcetype: mongoose.Mixed, sourcelink: mongoose.Mixed },
productName: {value: mongoose.Mixed, sourcetype: mongoose.Mixed, sourcelink: mongoose.Mixed },
currentMarket: {value: mongoose.Mixed, sourcetype: mongoose.Mixed, sourcelink: mongoose.Mixed },
SecondTable: SecondTableSchema,
Lastupdate: {type: Date, default: Date.now},
Created: {type: Date, default: Date.now},
Delete: Boolean
})

const MainTableS = mongoose.model('MainTableSchema', MainTableSchema);
module.exports = { SecondTable: SecondTableS, MainTable: MainTableS }