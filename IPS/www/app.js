var app = {};

app.devices = {};

app.ui = {};

app.ui.updateTimer = null;


app.startScan = function (callbackFun) {
    evothings.ble.stopScan();


    evothings.ble.startScan(
        function (device) {
            if (device.rssi <= 0) {
                callbackFun(device, null);
            }
        },
        function (errorCode) {
            callbackFun(null, errorCode);
        }
    );
};



app.ui.onStartScanButton = function () {
    app.startScan(app.ui.deviceFound);
    $('#scan-status').html('Scanning...');
    app.ui.updateTimer = setInterval(app.ui.displayDeviceList, 100);
    //document.getElementById('sendEmail').style.display = 'none';
    //document.getElementById('readings').style.display = 'none';
    //document.getElementById('location').style.display = 'inline';
    //document.getElementById('x_input').style.display = 'inline';
    //document.getElementById('y_input').style.display = 'inline';
    //document.getElementById('saveButton').style.display = 'inline';


};


app.ui.onStopScanButton = function () {
    evothings.ble.stopScan();
    app.devices = {};
    $('#scan-status').html('Calculation stopped');
    app.ui.displayDeviceList();
    clearInterval(app.ui.updateTimer);
    $('#readings').empty();
    csvText = '';
    //document.getElementById("x_input").value = '';
    //document.getElementById("y_input").value = '';
    //document.getElementById('twentySamples').style.display = 'none';
    //document.getElementById('twentySamplesText').style.display = 'none';
    //document.getElementById('startWalk').style.display = 'none';
    //document.getElementById('stopWalk').style.display = 'none';
    //document.getElementById('location').style.display = 'none';
    //document.getElementById('x_input').style.display = 'none';
    //document.getElementById('y_input').style.display = 'none';
    //document.getElementById('saveButton').style.display = 'none';
    //document.getElementById('sendEmail').style.display = 'none';
    //starting_point = true;
};


//sampleMatrix var;
//the beacons with MAC till 8C were registered in the last year and now I have registered the rst of the MACs for the implementation of the IPS
var beaconsMac = ['D4:F5:13:FF:11:4C', '20:C3:8F:E0:83:5B', /*'7C:EC:79:E0:20:24'/*'D4:F5:13:FE:81:6D'*/, '20:C3:8F:E0:90:8C', '7C:EC:79:3C:8E:86', '7C:EC:79:3C:93:F6',
    '7C:EC:79:3C:A4:A9', '7C:EC:79:3D:21:1A', '7C:EC:79:3D:A5:95', '7C:EC:79:3C:F6:9E', '7C:EC:79:3C:A4:D9', '7C:EC:79:3D:BD:1D', '7C:EC:79:3D:A0:11',
    'EC:11:27:29:B1:8F', '20:C3:8F:E0:90:9A', '20:C3:8F:E0:90:9D' ];
var sampleMatrix = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
var init = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];

//The following part actually registers our beacons to whom we are listening
app.ui.deviceFound = function (device, errorCode) {
    var wantedBeacon = false;

    beaconsMac.forEach(function (element, index) {
        if (element == device.address) {
            wantedBeacon = true;
        }

    });

    if (wantedBeacon == true) {
        if (device) {
            device.timeStamp = Date.now();

            app.devices[device.address] = device;
        }
        else if (errorCode) {
            $('#scan-status').html('Scan Error: ' + errorCode);

        }
    };
};


//this part displays our devices in the form of the table
app.ui.displayDeviceList = function () {
    $('#found-devices').empty();

    var timeNow = Date.now();

    $.each(app.devices, function (key, device) {
        if (device.timeStamp + 5000 > timeNow) {
            var rssiWidth = 100; // Used when RSSI is zero or greater.
            if (device.rssi < -100) { rssiWidth = 0; }
            else if (device.rssi < 0) { rssiWidth = 100 + device.rssi; }


            var coordinates = device.name.split("_");
            var x = parseFloat(coordinates[0]) / 10;
            var y = parseFloat(coordinates[1]) / 10;
            var h = new Date();

            var element = $(
                '<li>'
                + 'Name: <strong>' + device.name + '</strong><br />'
                + 'X: ' + x + '<br/>'
                + 'Y: ' + y + '<br/>'
                + 'MAC: ' + (evothings.os.isIOS() ? '' : device.address + '<br />')
                + 'Hour of register: ' + h.getHours() + ':' + h.getMinutes() + ':' + h.getSeconds() + ':' + h.getMilliseconds() + '<br />'
                + 'RSS: ' + device.rssi + '<br />'
                + '<div style="background:rgb(213, 149, 99);height:20px;width:'
                + rssiWidth + '%;"></div>'
                + '</li>'
            );

            $('#found-devices').append(element);

            //document.getElementById('show_sm').innerHTML = 'the device with mac adrs ' + device.address + ' has rss of ' + device.rssi;

            if (limitedSamples == true || walk == true) {
                beaconsMac.forEach(function (element, index) {
                    if (element == device.address) {
                        sampleMatrix[index][0] = device.address;
                        sampleMatrix[index][1] = x;
                        sampleMatrix[index][2] = y;
                        sampleMatrix[index][init[index]] = device.rssi;
                        sampleMatrix[index][init[index] + 1] = h.getHours() + ':' + h.getMinutes() + ':' + h.getSeconds() + ':' + h.getMilliseconds();
                        init[index] = init[index] + 2;

                        if (init[index] == 45 && limitedSamples == true) {
                            limitedSamples = false;
                            app.ui.stopWalk();
                            init[index] = 3;
                        };
                    };

                });
            };

        }
    });
    //document.getElementById('show_sm').innerHTML = 'the device with mac adrs ' + device_sm + ' has rss of ' + rssi_sm;
};


app.clearMatrix = function (matrix) {
    //this empties the init array
    init.length = 0;
    matrix.forEach(function (element, index) {
        //this empties the contents of the RSS and time for each of the beacons from the sampleMatrix matrix
        sampleMatrix[index].length = 0;
        //pushes 3 at the end of the init array
        init.push(3);
    });
};

var startingTime, table;
app.ui.startWalk = function () {
    app.clearMatrix(beaconsMac);
    var s = new Date();
    s = s.getHours() + ':' + s.getMinutes() + ':' + s.getSeconds() + ':' + s.getMilliseconds();
    startingTime = s;

    table = app.createTableHTML();

    walk = true;

    document.getElementById('startWalk').style.display = 'none';
    document.getElementById('twentySamples').style.display = 'none';
    document.getElementById('twentySamplesText').style.display = 'none';

    if (document.getElementById('twentySamples').checked == true) {
        limitedSamples = true;
    };
    if (document.getElementById('twentySamples').checked == false) {
        document.getElementById('stopWalk').style.display = 'inline';
        limitedSamples = false;
    };

};

app.createTableHTML = function () {

    var table = ' <tr>'
        + '<th>#</th>'
        + '<th>X*</th>'
        + '<th>Y*</th>';
    beaconsMac.forEach(function (element, index) {
        table += '<th>B' + (index + 1) + '</th>';// + '<th>Time' + (index + 1) + '</th>';
    });
    table += '</tr>';
    return table;
};


var limitedSamples = false;
var walk = false;

var samples = 0;
var endingTime;

app.ui.stopWalk = function () {

    walk = false;
    var e = new Date();

    e = e.getHours() + ':' + e.getMinutes() + ':' + e.getSeconds() + ':' + e.getMilliseconds();
    endingTime = e;
    sampleMatrix.forEach(function (element, index) {
        if (sampleMatrix[index].length > samples)
            samples = sampleMatrix[index].length;
    });

    samples = (samples - 3) / 2;

    document.getElementById('location').style.display = 'inline';
    document.getElementById('x_input').style.display = 'inline';
    document.getElementById('y_input').style.display = 'inline';
    document.getElementById('saveButton').style.display = 'inline'
    document.getElementById('stopWalk').style.display = 'none';

};

//we dont want to calculate the distance walked or time taken or speed so all the following lines are bogus
var csvText = '';
var initialX, initialY, endingX, endingY;
var starting_point = true;
app.saveCoordinates = function () {
    var confirmation;

    if (isNaN(parseFloat(document.getElementById("x_input").value)) || isNaN(parseFloat(document.getElementById("y_input").value))) {
        alert("Please, write a valid location");
        return;
    };

    if (starting_point == true) {
        initialX = parseFloat(document.getElementById("x_input").value);
        initialY = parseFloat(document.getElementById("y_input").value);
        confirmation = confirm('Starting location saved. \nX:' + initialX + '\nY:' + initialY);
        if (confirmation) {
            starting_point = false;
            $('#location').html('<font size="3">Coordinates of the ending point:</font>');

            //we hide again these
            document.getElementById('location').style.display = 'none';
            document.getElementById('x_input').style.display = 'none';
            document.getElementById('y_input').style.display = 'none';
            document.getElementById('saveButton').style.display = 'none';
            document.getElementById('twentySamples').style.display = 'inline';
            document.getElementById('twentySamplesText').style.display = 'inline';
            document.getElementById('startWalk').style.display = 'inline';
        }
        else return;

    }
    else {

        endingX = parseFloat(document.getElementById("x_input").value);
        endingY = parseFloat(document.getElementById("y_input").value);
        confirmation = confirm('Ending location saved.\nX:' + endingX + '\nY:' + endingY);
        if (confirmation) {

            var distanceX = Math.abs(endingX - initialX);
            var distanceY = Math.abs(endingY - initialY);
            //this function returns the total distance walked based in distance X and Y
            var totalDistance = app.calculateDistance(distanceX, distanceY);
            //this function returns the difference of time between two hours.
            var totalTime = app.calculateTime(startingTime, endingTime);
            alert('Distance walked in X: ' + distanceX + ',Y: ' + distanceY + '\nTotal:' + totalDistance);



            $('#location').html('<font size="3">Coordinates of the starting point:</font>');
            document.getElementById('location').style.display = 'none';
            document.getElementById('x_input').style.display = 'none';
            document.getElementById('y_input').style.display = 'none';
            document.getElementById('saveButton').style.display = 'none';
            starting_point = true;


            document.getElementById('readings').style.display = 'inline';



            var repetitions;
            var column = 3;
            var beacon, time;
            var X = 0;
            var Y = 0;
            var message = '';

            var speedX = distanceX / totalTime;
            var speedY = distanceY / totalTime;
            for (repetitions = 0; repetitions + 1 < samples; repetitions++) {

                time = app.calculateTime(startingTime, sampleMatrix[0][column + 1]);

                if (endingX < initialX) {
                    X = initialX - (speedX * time);
                }
                else {
                    X = (speedX * time) + initialX;
                };

                if (endingY < initialY) {
                    Y = initialY - (speedY * time);
                }
                else {
                    Y = (speedY * time) + initialY;
                };


                message += '<tr><th>' + (repetitions + 1) + '</th><td>' + X + '</td><td>' + Y + '</td>';
                csvText += '<tr><td>' + X + '</td><td>' + Y + '</td>';
                for (beacon = 0; beacon < sampleMatrix.length; beacon++) {
                    message += '<td>' + sampleMatrix[beacon][column] + '</td>';// + '<td>' + sampleMatrix[beacon][column + 1] + '</td>';
                    csvText += '<td>' + sampleMatrix[beacon][column] + '</td>';// + '<td>' + sampleMatrix[beacon][column + 1] + '</td>';
                };
                message += '</tr>';
                csvText += '</tr>';

                column = column + 2;
            };

            table += message;
            $('#readings').append($(table));
            document.getElementById('sendEmail').style.display = 'inline';
            //csvText  contains only X, Y and rss without heading of the table nor number of row
        }
        else return;

    };

};

//we dont require all these in our present work
app.calculateTime = function (startingTime, endingTime) {
    var start = startingTime.split(":");
    var end = endingTime.split(":");
    var startTime = (parseInt(start[0]) * 3600) + (parseInt(start[1]) * 60) + parseInt(start[2]) + (parseInt(start[3]) * 0.001);
    var endTime = (parseInt(end[0]) * 3600) + (parseInt(end[1]) * 60) + parseInt(end[2]) + (parseInt(end[3]) * 0.001);
    var totalTime = (endTime - startTime);
    //totalTime is the difference between endTime and startTime in seconds
    return totalTime;
};

//we dont require all these in our present work
app.calculateDistance = function (distanceX, distanceY) {

    if (distanceX != 0 && distanceY != 0) {
        var distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
        return distance;
    }
    else if (distanceX == 0 && distanceY != 0)
        return distanceY;
    else if (distanceX != 0 && distanceY == 0)
        return distanceX;

    else return (0);

};

