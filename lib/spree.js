/*
 * kak
 * https://github.com//kak
 *
 * Copyright (c) 2014 
 * Licensed under the MIT license.
 */

'use strict';


var app = require('express')(), venues = require('./services/venues'),
    events = require('./services/events');


app

    .all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods',
            'PUT, GET, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    })

    .get('/venues', function (req, res) {
        venues.all(function (err, venues) {
            if (!err) {
                res.jsonp({ "venues": venues });
            }
        });
    })

    .get('/events', function (req, res) {
        events.all(function (err, events) {
            if (!err) {
                res.jsonp({ "events": events });
            }
        })
    })

    .get('/events/at/:time', function (req, res) {
        var date = parse(req.param('time'));
        events.at(date, function (err, events) {
            if (!err) {
                res.jsonp({ "events": events });
            }
        })
    })

    .listen(3000, function () {
        console.log("Server running on port 3000");
    });


function parse(dateString) {
    var day = parseInt(dateString.substr(0, 2));
    var month = parseInt(dateString.substr(2, 2)) - 1;
    var year = parseInt(dateString.substr(4));
    return new Date(year, month, day);
}
