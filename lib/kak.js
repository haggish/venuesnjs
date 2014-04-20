/*
 * kak
 * https://github.com//kak
 *
 * Copyright (c) 2014 
 * Licensed under the MIT license.
 */

'use strict';


var app = require('express')(), venues = require('./services/venues');


app
    .get('/venues', function (req, res) {
        venues.all(function (err, venues) {
            if (!err)  {
                res.jsonp(venues);
            }
        });
    })

    .get('venues/at/:time', function (req, res) {
        venues.at(req.parameter('time'), function (err, venues) {
            if (!err) {
                res.jsonp(venues);
            }
        })
    })

    .listen(3000, function () {
        console.log("Server running on port 3000");
    });
