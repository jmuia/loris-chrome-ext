var cal = ics();
var classContainer = document.querySelector('div.pageBodyDiv').querySelectorAll('table.datadisplaytable');

var DAYS_OF_WEEK =
{ 
	//0   : 'S',
	1 : 'M',
	2 : 'T',
	3 : 'W',
	4 : 'R',
	5 : 'F',
	6 : 'S'
};


for (var i = 0; i < classContainer.length; i += 2) {
	var infoTable = classContainer[i];
	var meetingTimeInfo = classContainer[i+1].querySelectorAll('tbody tr')[1].querySelectorAll('td');

	// Only add courses you are enrolled in
	var status = infoTable.querySelectorAll('tbody tr td')[2].innerHTML;
	if (status.toLowerCase().indexOf('enrolled') === -1) continue;

	var className = infoTable.querySelector('caption').innerHTML;
	var classTime = meetingTimeInfo[1].innerHTML.split("-");
	var days      = meetingTimeInfo[2].innerHTML.split('');
	var loc       = meetingTimeInfo[3];
	if (loc.querySelector('abbr').length > 0) {
		loc = loc.innerHTML;
	} else {
		loc = 'TBA';
	}
	var daterange = meetingTimeInfo[4].innerHTML.split("-");

	var startTime = firstDayFromDate(days, new Date(daterange[0] + " " + classTime[0]));
	var endTime   = firstDayFromDate(days, new Date(daterange[0] + " " + classTime[1]));
	var termEnd  = new Date(daterange[1])
	termEnd.setDate(termEnd.getDate()+1);

	var recurrence = {
		'endDate' : termEnd,
		'days'    : days
	};

	cal.addEvent(className, '', loc, startTime, endTime, recurrence);
}

cal.download('studentdetailschedule');

function firstDayFromDate(days, date) {
	var foundDate = false;

	try {
		var safety = 0;
		while (!foundDate && (safety < 7)) {
			foundDate = (days.indexOf( DAYS_OF_WEEK[date.getDay()] ) > -1) || foundDate;
			if (!foundDate) date.setDate(date.getDate()+1);
			safety++;
		}
	} catch (error) {
		throw new Error(error)
	}
	
	return date;
}