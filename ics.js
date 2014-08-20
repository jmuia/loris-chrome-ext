/* global saveAs, Blob, BlobBuilder, console */
/* exported ics */

var ics = function() {
    'use strict';

    if (navigator.userAgent.indexOf('MSIE') > -1 && navigator.userAgent.indexOf('MSIE 10') == -1) {
        console.log('Unsupported Browser');
        return;
    }

    var SEPARATOR = (navigator.appVersion.indexOf('Win') !== -1) ? '\r\n' : '\n';
    var calendarEvents = [];
    var calendarStart = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0'
    ].join(SEPARATOR);
    var calendarEnd = SEPARATOR + 'END:VCALENDAR';
    var weekDayConstants = {
        //'S'   : "SU",
        'M' : "MO",
        'T' : "TU",
        'W' : "WE",
        'R' : "TH",
        'F' : "FR",
        'S' : "SA"
    };

    return {
        /**
         * Returns events array
         * @return {array} Events
         */
        'events': function() {
            return calendarEvents;
        },

        /**
         * Returns calendar
         * @return {string} Calendar in iCalendar format
         */
        'calendar': function() {
            return calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;
        },

        /**
         * Add event to the calendar
         * @param  {string} subject     Subject/Title of event
         * @param  {string} description Description of event
         * @param  {string} location    Location of event
         * @param  {string} begin       Beginning date of event
         * @param  {string} stop        Ending date of event
         */
        'addEvent': function(subject, description, location, begin, stop, recurrence) {
            // I'm not in the mood to make these optional... So they are all required
            if (typeof subject === 'undefined' ||
                typeof description === 'undefined' ||
                typeof location === 'undefined' ||
                typeof begin === 'undefined' ||
                typeof stop === 'undefined' || 
                typeof recurrence === 'undefined' ||
                typeof recurrence.days === 'undefined' ||
                typeof recurrence.endDate === 'undefined'
            ) {
                return false;
            };

            //TODO add time and time zone? use moment to format?
            var start_date = new Date(begin);
            var end_date = new Date(stop);
            var stamp_date = new Date();
            var recur_end_date = new Date(recurrence.endDate);

            var start_year = ("0000" + (start_date.getFullYear().toString())).slice(-4);
            var start_month = ("00" + ((start_date.getMonth() + 1).toString())).slice(-2);
            var start_day = ("00" + ((start_date.getDate()).toString())).slice(-2);
            var start_hours = ("00" + (start_date.getHours().toString())).slice(-2);
            var start_minutes = ("00" + (start_date.getMinutes().toString())).slice(-2);
            var start_seconds = ("00" + (start_date.getMinutes().toString())).slice(-2);

            var end_year = ("0000" + (end_date.getFullYear().toString())).slice(-4);
            var end_month = ("00" + ((end_date.getMonth() + 1).toString())).slice(-2);
            var end_day = ("00" + ((end_date.getDate()).toString())).slice(-2);
            var end_hours = ("00" + (end_date.getHours().toString())).slice(-2);
            var end_minutes = ("00" + (end_date.getMinutes().toString())).slice(-2);
            var end_seconds = ("00" + (end_date.getMinutes().toString())).slice(-2);

            var stamp_year = ("0000" + (stamp_date.getFullYear().toString())).slice(-4);
            var stamp_month = ("00" + ((stamp_date.getMonth() + 1).toString())).slice(-2);
            var stamp_day = ("00" + ((stamp_date.getDate()).toString())).slice(-2);
            var stamp_hours = ("00" + (stamp_date.getHours().toString())).slice(-2);
            var stamp_minutes = ("00" + (stamp_date.getMinutes().toString())).slice(-2);
            var stamp_seconds = ("00" + (stamp_date.getMinutes().toString())).slice(-2);

            var recur_end_year = ("0000" + (recur_end_date.getFullYear().toString())).slice(-4);
            var recur_end_month = ("00" + ((recur_end_date.getMonth() + 1).toString())).slice(-2);
            var recur_end_day = ("00" + ((recur_end_date.getDate()).toString())).slice(-2);
            var recur_end_hours = ("00" + (recur_end_date.getHours().toString())).slice(-2);
            var recur_end_minutes = ("00" + (recur_end_date.getMinutes().toString())).slice(-2);
            var recur_end_seconds = ("00" + (recur_end_date.getMinutes().toString())).slice(-2);

            // Since some calendars don't add 0 second events, we need to remove time if there is none...
            var start_time = '';
            var end_time = '';
            var stamp_time = 'T' + stamp_hours + stamp_minutes + stamp_seconds;
            var recur_end_time = 'T' + recur_end_hours + recur_end_minutes + recur_end_seconds;

            if (start_minutes + start_seconds + end_minutes + end_seconds != 0) {
                start_time = 'T' + start_hours + start_minutes + start_seconds;
                end_time = 'T' + end_hours + end_minutes + end_seconds;  
            }

            var start = start_year + start_month + start_day + start_time;
            var end = end_year + end_month + end_day + end_time;
            var stamp = stamp_year + stamp_month + stamp_day + stamp_time;
            var recurEnd = recur_end_year + recur_end_month + recur_end_day + recur_end_time;

            var rrule = '';
            rrule += 'FREQ=WEEKLY;';
            rrule += 'INTERVAL=1;';
            rrule += 'UNTIL=' + recurEnd + ';'
            rrule += 'BYDAY=';
            for (var i = 0; i < recurrence.days.length; i++) {
                rrule += weekDayConstants[recurrence.days[i]];
                if (i !== (recurrence.days.length - 1)) {
                    rrule += ',';
                }
            }

            var calendarEvent = [
                'BEGIN:VEVENT',
                'CLASS:PUBLIC',
                'DESCRIPTION:' + description,
                'DTSTAMP:' + stamp,
                'DTSTART:' + start,
                'DTEND:' + end,
                'RRULE:' + rrule,
                'LOCATION:' + location,
                'SUMMARY;LANGUAGE=en-us:' + subject,
                'TRANSP:TRANSPARENT',
                'END:VEVENT'
            ].join(SEPARATOR);

            calendarEvents.push(calendarEvent);
            return calendarEvent;
        },

        /**
         * Download calendar using the saveAs function from filesave.js
         * @param  {string} filename Filename
         * @param  {string} ext      Extention
         */
        'download': function(filename, ext) {
            if (calendarEvents.length < 1) {
                return false;
            }

            ext = (typeof ext !== 'undefined') ? ext : '.ics';
            filename = (typeof filename !== 'undefined') ? filename : 'calendar';
            var calendar = calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;

            var blob;
            if (navigator.userAgent.indexOf('MSIE 10') === -1) { // chrome or firefox
                blob = new Blob([calendar]);
            } else { // ie
                var bb = new BlobBuilder();
                bb.append(calendar);
                blob = bb.getBlob('text/x-vCalendar;charset=' + document.characterSet);
            }
            saveAs(blob, filename + ext);
            return calendar;
        }
    };
};
