/**
 * Repository for venues.
 */

'use strict';


var mongoose = require('mongoose');

var cfg = require('../cfg');

console.log(cfg.dbURL);
mongoose.connect(cfg.dbURL);


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function cb () {

    var Venue = mongoose.model('Venue', mongoose.Schema({
        id : Number,
        lat : Number,
        lng : Number,
        status : String,
        title : String,
        infoText : String
    }));

    exports.all = function (cb) {
        return Venue.find(function (err, venues) {
            if (!err) {
                cb(null, venues);
            } else {
                cb(err, null);
            }
        });
    }

});