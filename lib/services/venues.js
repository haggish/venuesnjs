/**
 * Repository for venues.
 */

'use strict';


var mongoose = require('mongoose');

var cfg = require('../cfg');

mongoose.connect(cfg.dbURL);


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function cb() {

    var Venue = mongoose.model('Venue', mongoose.Schema({
        id: Number,
        lat: Number,
        lng: Number,
        status: String,
        title: String,
        infoText: String
    }));

    exports.all = function (cb) {
        return Venue.find(function (err, venues) {
            if (!err) {
                cb(null, venues);
            } else {
                cb(err, null);
            }
        });
    };

    exports.add = function (venue) {
        new Venue(venue).save(function (err, savedVenue) {
            console.log('Venue saved: ' + savedVenue);
        });
    };

    exports.clear = function (cb) {
        Venue.remove({}, function (err) {
            console.log('Venues wiped out');
            cb(err);
        });
    };

});