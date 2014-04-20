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
    .get('/venues', function (req, res) {
        venues.all(function (err, venues) {
            if (!err)  {
                res.jsonp(venues);
            }
        });
    })

    .get('/events', function (req, res) {
        events.all(function (err, events) {
            if (!err) {
                res.jsonp(events);
            }
        })
    })

    .get('/events/at/:time', function (req, res) {
        venues.at(req.parameter('time'), function (err, events) {
            if (!err) {
                res.jsonp(events);
            }
        })
    })

    .listen(3000, function () {
        console.log("Server running on port 3000");
    });
