/**
 * Event importer that scrapes INDEX Berlin :)
 */
'use strict';

var http = require('http'), env = require('jsdom').env,
    venues = require('../services/venues');

http.request({
    host: 'indexberlin.de',
    path: '/geoItems/getGeoItems.php?NELat=52.568515980354704&' +
        'NELng=13.515549101562556&SWLat=52.4640539313278&' +
        'SWLng=13.240890898437556'
}, function (response) {
    var jsonString = '';

    response.on('data', function (chunk) {
        jsonString += chunk;
    });

    response.on('end', function () {
        console.log(jsonString);
        var json = JSON.parse(jsonString);
        venues.clear(function (err) {
            if (!err) {
                for (var idx = 0; idx < json.places.length; idx++) {
                    venues.add(json.places[idx]);
                }
            }
        });
    })
}).end();