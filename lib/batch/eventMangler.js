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

            function timesFrom(venuesItemElement) {
                var timeString = timeIn(venuesItemElement);
                if (!timeString) {
                    //console.log("no time for event");
                    return estimatedStartAndEnd();
                } else if (bothTimesIn(timeString)) {
                    //console.log("both times present");
                    return parsedStartAndEndFrom(timeString);
                } else {
                    //console.log("only starting time present");
                    return parsedStartAndEstimatedEndFrom(timeString);
                }
            }

            function time(hrs, mins, estimated) {
                var est = !(estimated === undefined);
                var hours = hrs;
                var minutes = mins === undefined ? 0 : mins;
                var ret = {};
                ret.hours = function () {
                    return hours;
                };
                ret.minutes = function () {
                    return minutes;
                };
                ret.asString = function () {
                    return hours + '.' + (minutes < 10 ?
                        ('0' + minutes) : minutes) + (est ? '(est)' : '');
                };
                ret.twoHoursLater = function () {
                    return estimatedTime(hours + 2, minutes);
                };
                ret.twelveHoursLater = function () {
                    return time(hours + 12, minutes);
                };
                ret.estimated = function () {
                    return est;
                };
                return ret;
            }

            function estimatedTime(hrs, mins) {
                return time(hrs, mins, true);
            }

            function estimatedStartAndEnd() {
                //console.log("estimating 19-21");
                return { "start": estimatedTime(19), "end": estimatedTime(21) }
            }

            function parsedStartAndEndFrom(timeString) {
                var startAndEnd = timeString.split('-');
                var start = parse(startAndEnd[0].trim());
                //console.log("start parsed to " + start.asString());
                var endString = startAndEnd[1].trim();
                var end = parse(endString);
                if (pm(endString) && start.hours() < end.hours()) {
                    console.log("the end has pm");
                    start = start.twelveHoursLater();
                    console.log("start bumped 12 hrs as end had pm: " +
                        start.asString());
                }
                //console.log("end parsed to " + end.asString());
                return { "start": start, "end": end }
            }

            function parse(timeString) {
                console.log("parsing " + timeString);
                var hourAndMinutes = timeString.split('.');
                if (hourAndMinutes.length == 1) {
                    hourAndMinutes = timeString.split(':');
                }
                if (hourAndMinutes.length == 1) {
                    //console.log("even hours " + hourAndMinutes[0]);
                    return time(pmParsed(hourAndMinutes[0]));
                } else {
                    if (pm(hourAndMinutes[1])) {
                        hourAndMinutes[0] =
                            parseInt(hourAndMinutes[0]) + 12 + '';
                        console.log("pm found in " + hourAndMinutes[1] +
                            ", +12-bumping " + timeString +
                            " >> " + hourAndMinutes[0] + '.' +
                            hourAndMinutes[1]);
                    }
                    //console.log("broken hours");
                    return time(parseInt(hourAndMinutes[0]),
                        parseInt(hourAndMinutes[1]));
                }
            }

            function parsedStartAndEstimatedEndFrom(timeString) {
                var start = parse(timeString);
                return { "start": start, "end": start.twoHoursLater() };
            }

            function pm(timeString) {
                return timeString.indexOf('pm') != -1;
            }

            function pmParsed(timeString) {
                var indexOfPM = timeString.indexOf('pm');
                if (indexOfPM == -1) {
                    //console.log('no pm in ' + timeString);
                    return parseInt(timeString);
                } else {
                    var nopm = parseInt(
                        timeString.substring(0, indexOfPM).trim()) + 12;
                    //console.log('pm found in ' + timeString + ', now ' + nopm);
                    return nopm;
                }
            }

            function timeIn(element) {
                var elementText = $('.col2', element).text();
                var startAndEndTime = elementText
                    .substring(0, elementText.indexOf('add to calendar'))
                    .trim();
                console.log("raw time: " + startAndEndTime);
                if (noTimeIn(startAndEndTime)) {
                    return undefined;
                }
                return startAndEndTime
                    .substring(startAndEndTime.lastIndexOf('|') + 2).trim();
            }

            function noTimeIn(text) {
                return text.indexOf('|') == -1 ||
                    text.indexOf('|') == text.lastIndexOf('|');
            }

            function bothTimesIn(timeString) {
                return timeString.indexOf('-') != -1;
            }

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
                //console.log('===== NEW ITEM ====');
                var times = timesFrom(venuesItemElement);
                console.log('parsed time: ' + times.start.asString() + '-' +
                    times.end.asString());
                var start = parse(date, times.start);
                var end = parse(date, times.end);
                $('.mapExhibitions', venuesItemElement).remove();
                var desc = $('.col3', venuesItemElement).html()
                    .replace(/\s+/g, ' ');

                return event(id, start, end, desc, venue);

                function event(givenID, givenStart, givenEnd, givenDesc, venue) {
                    return {
                        id: function () {
                            return givenID;
                        },
                        start: function () {
                            return givenStart;
                        },
                        end: function () {
                            return givenEnd;
                        },
                        desc: function () {
                            return givenDesc;
                        },
                        venue: function () {
                            return venue;
                        }
                    }
                }

                function parse(date, time) {
                    date = date.trim();
                    var day = parseInt(date.substr(0, 2));
                    var month = parseMonth(date.substr(3, 3)) - 1;
                    var year = parseInt(date.substr(7, 4));

                    return new Date(
                        year, month, day, time.hours(), time.minutes());
                }

                function parseMonth(month) {
                    var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
                        "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return months.indexOf(month) + 1;
                }
            }
        });
    })
}).
    end();