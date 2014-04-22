/**
 * Event importer that scrapes INDEX Berlin :)
 */
'use strict';

var http = require('http'), env = require('jsdom').env,
    events = require('../services/events');

http.request({
    host: 'indexberlin.de',
    path: '/openings-and-events'
}, function (response) {
    var html = '';

    response.on('data', function (chunk) {
        html += chunk;
    });

    response.on('end', function () {
        env(html, function (errors, window) {
            var $ = require('jquery')(window);

            events.clear(function (err) {
                if (!err) {
                    $('.venuesItem').each(function (idx, e) {
                        events.add(eventFrom(e));
                    });
                }
            });

            function eventFrom(venuesItemElement) {
                var id = $('#venueName', venuesItemElement).attr('venueid')
                    .replace(/\s+/g, ' ');
                var venue = $('#venueName', venuesItemElement).text()
                    .replace(/\s+/g, ' ');
                var date = $('.mapExhibitions > div > div', venuesItemElement)
                    .first().text().replace(/\s+/g, ' ');
                if (date.indexOf(' *') != -1) {
                    date = date.substr(0, date.indexOf(' *'));
                }
                date = parse(date);
                $('.mapExhibitions', venuesItemElement).remove();
                var desc = $('.col3', venuesItemElement).html()
                    .replace(/\s+/g, ' ');

                return event(id, date, desc, venue);

                function event(givenID, givenDate, givenDesc, venue) {
                    return {
                        id: function () {
                            return givenID;
                        },
                        date: function () {
                            return givenDate;
                        },
                        desc: function () {
                            return givenDesc;
                        },
                        venue: function () {
                            return venue;
                        }
                    }
                }

                function parse(date) {
                    date = date.trim();
                    var day = parseInt(date.substr(0, 2));
                    var month = parseMonth(date.substr(3, 3)) - 1;
                    var year = parseInt(date.substr(7, 4));
                    return new Date(year, month, day);
                }

                function parseMonth(month) {
                    var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
                        "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return months.indexOf(month) + 1;
                }
            };
        });
    })
}).end();