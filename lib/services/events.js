/**
 * Repository for events.
 */

'use strict';


var mongoose = require('mongoose');

var cfg = require('../cfg');

mongoose.connect(cfg.dbURL);


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function cb() {

    var Event = mongoose.model('Event', mongoose.Schema({
        id: Number,
        date: Date,
        desc: String,
        venue: String
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

    exports.add = function (event) {
        new Event({
            id: event.id(),
            date: event.date(),
            desc: event.desc(),
            venue: event.venue()
        }).save(function (err, savedEvent) {
                console.log('Event saved: ' + savedEvent);
            });
    }

    exports.clear = function (cb) {
        Event.remove({}, function (err) {
            console.log('Events wiped out');
            cb(err);
        });
    }

    exports.at = function (time, cb) {
        var nextDay =
            new Date(time.getFullYear(), time.getMonth(), time.getDate() + 1);
        console.log(time + " >= event < " + nextDay);
        return Event.find({ "date": { $gte: time, $lt: nextDay} },
            function (err, events) {
                if (!err) {
                    cb(null, events);
                } else {
                    cb(err, null);
                }
            });
    }

});