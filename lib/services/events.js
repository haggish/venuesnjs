/**
 * Repository for events.
 */

'use strict';


var mongoose = require('mongoose');

var cfg = require('../cfg');

mongoose.connect(cfg.eventsDBURL);


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function cb () {

    var Event = mongoose.model('Event', mongoose.Schema({
        id : Number,
        date : Date,
        desc : String,
        venue : String
    }));

    exports.all = function (cb) {
        return Event.find(function (err, events) {
            if (!err) {
                cb(null, events);
            } else {
                cb(err, null);
            }
        });
    }

});