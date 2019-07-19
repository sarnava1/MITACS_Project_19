// This is the real script which does all our work!!!!!!

// Defining the variables

var app = {};

app.devices = {};

app.ui = {};

app.ui.updateTimer = null;

// These variables store the average the beacons coordinates which are deployed(active) for the normalization
var avgbx = 11.971;
var avgby = 49.171;

// The beacons with MAC till 8C were registered in the last year and now I have registered the rst of the MACs for the implementation of the IPS
var beaconsMac = ['D4:F5:13:FF:11:4C', '20:C3:8F:E0:83:5B', '20:C3:8F:E0:90:9A' /*'7C:EC:79:E0:20:24'/*'D4:F5:13:FE:81:6D'*/, '20:C3:8F:E0:90:8C', '7C:EC:79:3C:8E:86', '7C:EC:79:3C:93:F6',
    '7C:EC:79:3C:A4:A9', '7C:EC:79:3D:21:1A', '7C:EC:79:3D:A5:95', '7C:EC:79:3C:F6:9E', '7C:EC:79:3C:A4:D9', '7C:EC:79:3D:BD:1D', '7C:EC:79:3D:A0:11',
    'EC:11:27:29:B1:8F', '20:C3:8F:E0:90:9D'];

// The use of this variable is documented in the documentation
// The sampleMatrix has the samples of the RSS readings of the beacons in dBm
var sampleMatrix = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

// The use of this variable is documented in the documentation
var init = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];

// Initializing the sampleMatrix matrix with all zeroes
for (i = 0; i < 15; i++) {
    for (j = 0; j < 23; j++) {
        sampleMatrix[i][j] = 0;
    }
}

// The mwrss has the samples of the RSS readings of the beacons in milli watts and that is why the name is like that
var mwrss = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

// Initializing the sampleMatrix matrix with all zeroes
for (i = 0; i < 15; i++) {
    for (j = 0; j < 23; j++) {
        mwrss[i][j] = 0;
    }
}

// This will have the sum of all the beacon readings at a particular time ie of a column
var sumofbeaconsreadingsincol = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// This matrix will contain the weights of the various beacons at their respective times. This will be a 15*23 matrix
var weighttable = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

// Initializing the weighttable matrix with all zeroes
for (i = 0; i < 15; i++) {
    for (j = 0; j < 23; j++) {
        weighttable[i][j] = 0;
    }
}

// This array will have the 20 probable Xs
var arrx = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// This array will have the 20 probable Xs
var arry = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// This variable will store the avg X for a position
var xx= 0 ;

// This variable will store the avg Y for a position
var yy = 0;

// This map will store the scores for the rooms
const m = new Map();

// This variable will store the min of the score which will be attained by the rooms
var min = 1000000;

// This array will store the scores of all the rooms
var scorearr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// This variable will store the optimum room which has been found
var room = -1;

// This variable is used to hold the scores of the individual rooms 
var score = 0;

// This variable will store the count of the no of rooms that we want to display in our result
var count = 0;

// This array will have the 4 readings for the moving avg of the x coordinates
var xmovavg = [0, 0, 0, 0];

// This array will have the 4 readings for the moving avg of the y coordinates
var ymovavg = [0, 0, 0, 0];

//This variable will be used to calculate the moving average
var indexmovavg = 0;


// This is the data of the POI points in the 
/*
Room no Xmin    Xmax    Ymin    Ymax
2106	7.97	11.86	85.46	85.46
2107	0.1	4.03	85.46	85.46
2108	4.04	7.97	85.46	85.46
2109	14.37	18.97	85.46	85.46
2110	18.97	22.53	85.46	85.46
2111	22.53	26.02	85.46	85.46
2112	23.38	26.85	62.59	65.84
2113	19.9	23.38	62.59	65.84
2114	14.61	19.9	62.59	65.84
2201	14.35	21.71	33.65	33.65
2203	0.1	10	0.1	30
2205	13.34	20.00	35.92	35.92
2207	11.09	13.34	35.92	35.92
2208	8.77	11.09	35.92	35.92
2209	1.94	8.77	35.92	35.92
2210    0.1     4       34      43
2211	1.64	1.64	46.1	48.94
2212	1.64	1.64	48.94	51.8
2213	1.64	1.64	51.8	54.66
2214	1.64	1.64	54.66	57.31
2215	1.64	1.64	57.31	59.34
2216	7.71	14.28	59.34	59.34
2219	14.28	21.15	59.34	59.34
2220	21.15	26.06	59.34	59.34
2105B	26.85	26.85	73.14	81.94
2105C	26.85	26.85	65.84	73.14
2105D	12.31	14.61	62.59	65.84
2105A	11.86	14.37	62.59	85.46
Elevator(2nd floor)	24.9	25.9	33.65	33.65
Stair 5	7.06	8.28	33.65	33.65
Stair 6	5.36	6.55	62.59	62.59
Stair 7	0.1	0.1	88.01	89.1
Washroom W206	21.71	24.9	33.65	33.65
Washroom W207	9.23	14.35	33.65	33.65

THESE DATAS ARE FOR FINETUNING PURPOSE. THEY ARE ALL OF ROOM 2203

SECTION 1	0.1	 5	 0.1	2.60
SECTION 2	5	 10	 0.1	2.60
SECTION 3	0.1	 5	 2.60	8
SECTION 4	5	 10	 2.60	8
SECTION 5	0.1	 5	 8	    12.2
SECTION 6	5	 10	 8	    12.2
SECTION 7	0.1	 5	 12.2	16.5
SECTION 8	5	 10	 12.2	16.5
SECTION 9	0.1	 5	 16.5	20.7
SECTION 10	5	 10	 16.5 	20.7
SECTION 11	0.1  5	 20.7	25
SECTION 12	5	 10	 20.7	25
SECTION 13	0.1	 5	 25  	31
SECTION 14	5	10	 25 	31
*/

// This matrix will store the Xmin, Xmax, Ymin, Ymax for all the POIs of our project
var roommatrix = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
                  [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

// Storing the data in the roommatrix matrix
//2106
roommatrix[0][0] = 2106;          
roommatrix[0][1] = 7.97;
roommatrix[0][2] = 11.86;
roommatrix[0][3] = 85.46;
roommatrix[0][4] = 85.46;
//2107
roommatrix[1][0] = 2107;
roommatrix[1][1] = 0.1;
roommatrix[1][2] = 4.03;
roommatrix[1][3] = 85.46;
roommatrix[1][4] = 85.46;
//2108
roommatrix[2][0] = 2108;
roommatrix[2][1] = 4.04;
roommatrix[2][2] = 7.97;
roommatrix[2][3] = 85.46;
roommatrix[2][4] = 85.46;
//2109
roommatrix[3][0] = 2109;
roommatrix[3][1] = 0.1;
roommatrix[3][2] = 4.03;
roommatrix[3][3] = 85.46;
roommatrix[3][4] = 85.46;
//2110
roommatrix[4][0] = 2110;
roommatrix[4][1] = 18.97;
roommatrix[4][2] = 22.53;
roommatrix[4][3] = 85.46;
roommatrix[4][4] = 85.46;
//2111
roommatrix[5][0] = 2111;
roommatrix[5][1] = 22.53;
roommatrix[5][2] = 26.02;
roommatrix[5][3] = 85.46;
roommatrix[5][4] = 85.46;
//2112
roommatrix[6][0] = 2112; 
roommatrix[6][1] = 23.38;
roommatrix[6][2] = 26.85;
roommatrix[6][3] = 62.59;
roommatrix[6][4] = 65.84;
//2113   
roommatrix[7][0] = 2113;
roommatrix[7][1] = 19.9;
roommatrix[7][2] = 23.38;
roommatrix[7][3] = 62.59;
roommatrix[7][4] = 65.84;
//2114   
roommatrix[8][0] = 2114;
roommatrix[8][1] = 14.61;
roommatrix[8][2] = 19.9;
roommatrix[8][3] = 62.59;
roommatrix[8][4] = 65.84;
//2201
roommatrix[9][0] = 2201;
roommatrix[9][1] = 14.35;
roommatrix[9][2] = 21.71;
roommatrix[9][3] = 33.65;
roommatrix[9][4] = 33.65;
//2203
roommatrix[10][0] = 2203;
roommatrix[10][1] = 0.1;
roommatrix[10][2] = 10;
roommatrix[10][3] = 0.1;
roommatrix[10][4] = 30;
//2205
roommatrix[11][0] = 2205;
roommatrix[11][1] = 13.34;
roommatrix[11][2] = 25.99;
roommatrix[11][3] = 35.92;
roommatrix[11][4] = 35.92;
//2207
roommatrix[12][0] = 2207;
roommatrix[12][1] = 11.09;
roommatrix[12][2] = 13.34;
roommatrix[12][3] = 35.92;
roommatrix[12][4] = 35.92;
//2208
roommatrix[13][0] = 2208;
roommatrix[13][1] = 8.77;
roommatrix[13][2] = 11.09;
roommatrix[13][3] = 35.92;
roommatrix[13][4] = 35.92;
//2209
roommatrix[14][0] = 2209;
roommatrix[14][1] = 1.94;
roommatrix[14][2] = 8.77;
roommatrix[14][3] = 35.92;
roommatrix[14][4] = 35.92;
//2211	
roommatrix[15][0] = 2211;
roommatrix[15][1] = 1.64;
roommatrix[15][2] = 1.64;
roommatrix[15][3] = 46.1;
roommatrix[15][4] = 48.94;
//2212
roommatrix[16][0] = 2212;
roommatrix[16][1] = 1.64;
roommatrix[16][2] = 1.64;
roommatrix[16][3] = 48.94;
roommatrix[16][4] = 51.8;
//2213	
roommatrix[17][0] = 2213;
roommatrix[17][1] = 1.64;
roommatrix[17][2] = 1.64;
roommatrix[17][3] = 51.8;
roommatrix[17][4] = 54.66;
//2214	
roommatrix[18][0] = 2214;
roommatrix[18][1] = 1.64;
roommatrix[18][2] = 1.64;
roommatrix[18][3] = 54.66;
roommatrix[18][4] = 57.31;
//2215	
roommatrix[19][0] = 2215;
roommatrix[19][1] = 1.64;
roommatrix[19][2] = 1.64;
roommatrix[19][3] = 57.31;
roommatrix[19][4] = 59.34;
//2216	7.71	14.28	59.34	59.34
roommatrix[20][0] = 2216;
roommatrix[20][1] = 7.71;
roommatrix[20][2] = 14.28;
roommatrix[20][3] = 59.34;
roommatrix[20][4] = 59.34;
//2219	14.28	21.15	59.34	59.34
roommatrix[21][0] = 2219;
roommatrix[21][1] = 14.28;
roommatrix[21][2] = 21.15;
roommatrix[21][3] = 59.34;
roommatrix[21][4] = 59.34;
//2220	21.15	26.06	59.34	59.34
roommatrix[22][0] = 2220;
roommatrix[22][1] = 21.15;
roommatrix[22][2] = 26.06;
roommatrix[22][3] = 59.34;
roommatrix[22][4] = 59.34;
//2105B	26.85	26.85	73.14	81.94
roommatrix[23][0] = "2105B";
roommatrix[23][1] = 26.85;
roommatrix[23][2] = 26.85;
roommatrix[23][3] = 73.14;
roommatrix[23][4] = 81.94;
//2105C	26.85	26.85	65.84	73.14
roommatrix[24][0] = "2105C";
roommatrix[24][1] = 26.85;
roommatrix[24][2] = 26.85;
roommatrix[24][3] = 65.84;
roommatrix[24][4] = 73.14;
//2105D	12.31	14.61	62.59	65.84
roommatrix[25][0] = "2105D";
roommatrix[25][1] = 12.31;
roommatrix[25][2] = 14.61;
roommatrix[25][3] = 62.59;
roommatrix[25][4] = 65.84;
//2105A	11.86	14.37	62.59	85.46
roommatrix[26][0] = "2105A";
roommatrix[26][1] = 11.86;
roommatrix[26][2] = 14.37;
roommatrix[26][3] = 62.59;
roommatrix[26][4] = 85.46;
//Elevator(2nd floor)	24.9	25.9	33.65	33.65
roommatrix[27][0] = "Elevator(2nd floor)";
roommatrix[27][1] = 24.9;
roommatrix[27][2] = 25.9;
roommatrix[27][3] = 33.65;
roommatrix[27][4] = 33.65;
//Stair 5	7.06	8.28	33.65	33.65
roommatrix[28][0] = "Stair 5";
roommatrix[28][1] = 7.06;
roommatrix[28][2] = 8.28;
roommatrix[28][3] = 33.65;
roommatrix[28][4] = 33.65;
//Stair 6	5.36	6.55	62.59	62.59
roommatrix[29][0] = "Stair 6";
roommatrix[29][1] = 5.36;
roommatrix[29][2] = 6.55;
roommatrix[29][3] = 62.59;
roommatrix[29][4] = 62.59;
//Stair 7	0.1	0.1	88.01	89.1
roommatrix[30][0] = "Stair 7";
roommatrix[30][1] = 0.1;
roommatrix[30][2] = 0.1;
roommatrix[30][3] = 88.01;
roommatrix[30][4] = 89.1;
//Washroom W206	21.71	24.9	33.65	33.65
roommatrix[31][0] = "Washroom W206";
roommatrix[31][1] = 21.71;
roommatrix[31][2] = 24.9;
roommatrix[31][3] = 33.65;
roommatrix[31][4] = 33.65;
//Washroom W207	9.23	14.35	33.65	33.65
roommatrix[32][0] = "Washroom W207";
roommatrix[32][1] = 9.23;
roommatrix[32][2] = 14.35;
roommatrix[32][3] = 33.65;
roommatrix[32][4] = 33.65;
//SECTION 1	0.1	5	0.1	2.60
roommatrix[33][0] = "2203 SECTION 1";
roommatrix[33][1] = 0.1;
roommatrix[33][2] = 5;
roommatrix[33][3] = 0.1;
roommatrix[33][4] = 2.60;
//SECTION 2	5	10	0.1	2.60
roommatrix[34][0] = "2203 SECTION 2";
roommatrix[34][1] = 5;
roommatrix[34][2] = 10;
roommatrix[34][3] = 0.1;
roommatrix[34][4] = 2.60;
//SECTION 3 0.1	 5	 2.60	8
roommatrix[35][0] = "2203 SECTION 3";
roommatrix[35][1] = 0.1;
roommatrix[35][2] = 5;
roommatrix[35][3] = 2.6;
roommatrix[35][4] = 8;
//SECTION 4	5  10  2.60	8
roommatrix[36][0] = "2203 SECTION 4";
roommatrix[36][1] = 5;
roommatrix[36][2] = 10;
roommatrix[36][3] = 2.6;
roommatrix[36][4] = 8;
//SECTION 5	0.1	 5	 8  12.2
roommatrix[37][0] = "2203 SECTION 5";
roommatrix[37][1] = .1;
roommatrix[37][2] = 5;
roommatrix[37][3] = 8;
roommatrix[37][4] = 12.2;
//SECTION 6	  5	 10	 8	 12.2
roommatrix[38][0] = "2203 SECTION 6";
roommatrix[38][1] = 5;
roommatrix[38][2] = 10;
roommatrix[38][3] = 8;
roommatrix[38][4] = 12.2;
//SECTION 7	0.1	 5	 12.2	16.5
roommatrix[39][0] = "2203 SECTION 7";
roommatrix[39][1] = 0.1;
roommatrix[39][2] = 5;
roommatrix[39][3] = 12.2;
roommatrix[39][4] = 16.5;
//SECTION 8	5	 10	 12.2	16.5
roommatrix[40][0] = "2203 SECTION 8";
roommatrix[40][1] = 5;
roommatrix[40][2] = 10;
roommatrix[40][3] = 12.2;
roommatrix[40][4] = 16.5;
//SECTION 9	0.1	 5	 16.5	20.7
roommatrix[41][0] = "2203 SECTION 9";
roommatrix[41][1] = 0.1;
roommatrix[41][2] = 5;
roommatrix[41][3] = 16.5;
roommatrix[41][4] = 20.7;
//SECTION 10	5	 10	 16.5 	20.7
roommatrix[42][0] = "2203 SECTION 10";
roommatrix[42][1] = 5;
roommatrix[42][2] = 10;
roommatrix[42][3] = 16.5;
roommatrix[42][4] = 20.7;
//SECTION 11	0.1  5	 20.7	25
roommatrix[43][0] = "2203 SECTION 11";
roommatrix[43][1] = 0.1;
roommatrix[43][2] = 5;
roommatrix[43][3] = 20.7;
roommatrix[43][4] = 25;
//SECTION 12	5	 10	 20.7	25
roommatrix[44][0] = "2203 SECTION 12";
roommatrix[44][1] = 5;
roommatrix[44][2] = 10;
roommatrix[44][3] = 20.7;
roommatrix[44][4] = 25;
//SECTION 13	0.1	 5	 25  	31
roommatrix[45][0] = "2203 SECTION 13";
roommatrix[45][1] = 0.1;
roommatrix[45][2] = 5;
roommatrix[45][3] = 25;
roommatrix[45][4] = 31;
//SECTION 14	5	10	 25 	31
roommatrix[46][0] = "2203 SECTION 14";
roommatrix[46][1] = 5;
roommatrix[46][2] = 10;
roommatrix[46][3] = 25;
roommatrix[46][4] = 31;
//2210    0.1     4       34      43
roommatrix[47][0] = "2210";
roommatrix[47][1] = 0.1;
roommatrix[47][2] = 4;
roommatrix[47][3] = 34;
roommatrix[47][4] = 43;


// The code for starting the scan of the phone to scan the ble devices
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

// This controls the ui on pressing the start scan button
app.ui.onStartScanButton = function () {
        
    // Here we again initialize our variables with their initial values
    
    for (i = 0; i < 15; i++) {
        for (j = 0; j < 23; j++) {
            sampleMatrix[i][j] = 0;
        }
    }

    for (i = 0; i < 15; i++) {
        for (j = 0; j < 23; j++) {
            mwrss[i][j] = 0;
        }
    }

    for (i = 0; i < 15; i++) {
        for (j = 0; j < 23; j++) {
            weighttable[i][j] = 0;
        }
    }

    init = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];

    sumofbeaconsreadingsincol = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    arry = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    arrx = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    
    xx = 0;
    yy = 0;

    // Clearing the map on the starting of the calculations
    m.clear();

    min = 1000000;

    scorearr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    room = -1;

    score = 0;

    count = 0;

    //xmovavg = [0, 0, 0, 0];

    //ymovavg = [0, 0, 0, 0];

    //indexmovavg = 0;

    if (indexmovavg > 3)
        indexmovavg = 0;

    // Initially there should be no writing on the screen
    var displayvanish = document.getElementById("showfinalresult");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showmap");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showroom");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showxy");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showweighttable");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("sumofcolshow");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("matrixdiv");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("mwrssshow");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showmovavg");
    displayvanish.style.display = "none";

    app.startScan(app.ui.deviceFound);
    $('#scan-status').html('<b>Helping you...Calibrating results</b>');
    app.ui.updateTimer = setInterval(app.ui.displayDeviceList, 100);

    setTimeout(function () { $('#scan-status').html('<b>Results ready..Click WHERE AM I??? to see!!</b>'); }, 3000);
};


// For clearing the matrix after completion of training
app.clearMatrix = function (matrix) {

    // This empties the init array
    init.length = 0;

    matrix.forEach(function (element, index) {
        // This empties the contents of the RSS and time for each of the beacons from the sampleMatrix matrix
        sampleMatrix[index].length = 0;
        // Pushes 3 at the end of the init array
        init.push(3);
    });

};

// This controls the ui on pressing the reset button. 
app.ui.onResetScanButton = function () {

    // Here we again initialize all the variables to their initial values as we are resetting for our fresh calculations
        
    
    for (i = 0; i < 15; i++) {
        for (j = 0; j < 23; j++) {
            sampleMatrix[i][j] = 0;
        }
    }

    for (i = 0; i < 15; i++) {
        for (j = 0; j < 23; j++) {
            mwrss[i][j] = 0;
        }
    }

    for (i = 0; i < 15; i++) {
        for (j = 0; j < 23; j++) {
            weighttable[i][j] = 0;
        }
    }

    init = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];

    sumofbeaconsreadingsincol = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    arry = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    arrx = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


    xx = 0;
    yy = 0;

    // Clearing the map on the resetting of the calculations
    m.clear();

    min = 1000000;

    scorearr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    room = -1;

    score = 0;

    count = 0;

    //xmovavg = [0, 0, 0, 0];

    //ymovavg = [0, 0, 0, 0];

    //indexmovavg = 0;

    if (indexmovavg > 3)
        indexmovavg = 0;

    // All the writings on the screen should vanish on pressing the RESET button
    var displayvanish = document.getElementById("showfinalresult");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showmap");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showroom");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showxy");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showweighttable");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("sumofcolshow");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("matrixdiv");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("mwrssshow");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showmovavg");
    displayvanish.style.display = "none";

    evothings.ble.stopScan();
    app.devices = {};

    app.clearMatrix(beaconsMac);

    $('#scan-status').html('Click <b>CLICK TO ACTIVATE</b> button to help you!!');

    app.ui.displayDeviceList();
    clearInterval(app.ui.updateTimer);

};

// This function will reset everything to initial state after calculating moving average
function refreshmovavg() {

    // Here we again initialize all the variables to their initial values as we are resetting for our fresh calculations

    for (i = 0; i < 15; i++) {
        for (j = 0; j < 23; j++) {
            sampleMatrix[i][j] = 0;
        }
    }

    for (i = 0; i < 15; i++) {
        for (j = 0; j < 23; j++) {
            mwrss[i][j] = 0;
        }
    }

    for (i = 0; i < 15; i++) {
        for (j = 0; j < 23; j++) {
            weighttable[i][j] = 0;
        }
    }

    init = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];

    sumofbeaconsreadingsincol = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    arry = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    arrx = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


    xx = 0;
    yy = 0;

    // Clearing the map on the resetting of the calculations
    m.clear();

    min = 1000000;

    scorearr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    room = -1;

    score = 0;

    count = 0;

    xmovavg = [0, 0, 0, 0];

    ymovavg = [0, 0, 0, 0];

    indexmovavg = 0;

    // All the writings on the screen should vanish on pressing the RESET button
    var displayvanish = document.getElementById("showfinalresult");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showmap");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showroom");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showxy");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showweighttable");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("sumofcolshow");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("matrixdiv");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("mwrssshow");
    displayvanish.style.display = "none";

    displayvanish = document.getElementById("showmovavg");
    displayvanish.style.display = "none";

    evothings.ble.stopScan();
    app.devices = {};

    app.clearMatrix(beaconsMac);

    $('#scan-status').html('Click <b>CLICK TO ACTIVATE</b> button to help you!!');

    app.ui.displayDeviceList();
    clearInterval(app.ui.updateTimer);
}


// This controls the ui on pressing the stop scan button
app.ui.onStopScanButton = function () {

    evothings.ble.stopScan();
    app.devices = {};

    $('#scan-status').html('Calculation Stopped');

    app.ui.displayDeviceList();
    clearInterval(app.ui.updateTimer);
};


// The following part actually registers our beacons to whom we are listening
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

// This part displays our devices in the form of the table
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

            //this actually appends to the list which shows the list of available ble devices
            $('#found-devices').append(element);

            beaconsMac.forEach(function (element, index) {
                    if (element == device.address) {
                        if (init[index] <= 22) {
                            sampleMatrix[index][0] = device.address;
                            sampleMatrix[index][1] = x;
                            sampleMatrix[index][2] = y;
                            sampleMatrix[index][init[index]] = device.rssi;
                            init[index] = init[index] + 1;
                        } 
        
                    };

                });
            //};

        }
    });
    
};


// This function shows the matrix sampleMatirx as a table of lists
function showRSStable() {

    text = "Showing RSS values in dBm" + "<br>";

    text = text + "<ol> ";
    for (var i = 0; i < 15; i++) {
        text = text + "<li> "
        for (var j = 0; j < 23; j++){
            text = text + sampleMatrix[i][j] + " ; ";
        }
        text = text + "</li> ";
    }
    text  = text + "</ol> ";
    document.getElementById("matrixshow").innerHTML = text;

    var x = document.getElementById("matrixdiv");
    if (x.style.display === "none") {
        x.style.display = "block";

    } else {
        x.style.display = "none";
    }
    
}

// This function shows/hides the dynamic list of the devices on clicking the SHOW/HIDE DL button
function showhidedlfn() {
    var x = document.getElementById("showhidedl");
    if (x.style.display === "none") {
        x.style.display = "block";

    } else {
        x.style.display = "none";
    }
}

// This function will shift the coordinates of the beacons by avgbx and avgby for normalization
function shiftcoordinates() {
    for (var i = 0; i < 15; i++) {
        if (sampleMatrix[i][0] != 0) {
            sampleMatrix[i][1] = sampleMatrix[i][1] - avgbx;
            sampleMatrix[i][2] = sampleMatrix[i][2] - avgby;
        }
    }
}

// This function calculates the RSS values in miliwatts from the dBm values which we got from the beacons
function calcRSSmw() {
    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 23; j++) {
            if (j == 0) {
                mwrss[i][j] = sampleMatrix[i][j];
            } else if (j == 1) {
                mwrss[i][j] = sampleMatrix[i][j];
            } else if (j == 2) {
                mwrss[i][j] = sampleMatrix[i][j];
            } else {
                if (sampleMatrix[i][j] != 0)
                    mwrss[i][j] = Math.pow(10, (sampleMatrix[i][j] / 10));
                else
                    mwrss[i][j] = 0;
            }
        }
    }
}


// This function shows the RSS values in miliwatts to the user
function showRSSmw() {

    text = "Showing RSS values in milli watts" + "<br>";

    text = text + "<ol> ";

    for (var i = 0; i < 15; i++) {
        text = text + "<li> ";
        for (var j = 0; j < 23; j++) {
            text = text + mwrss[i][j] + " ; ";
        }
        text = text + "</li> ";
    }
    text = text + "</ol> ";
    document.getElementById("mwrssshow").innerHTML = text;

    var x = document.getElementById("mwrssshow");
    if (x.style.display === "none") {
        x.style.display = "block";

    } else {
        x.style.display = "none";
    }
}

function calcsumcol() {
    for (var j = 3; j <= 22; j++) {
        for (var i = 0; i <= 14; i++) {
            sumofbeaconsreadingsincol[j-3] = sumofbeaconsreadingsincol[j-3] + mwrss[i][j] ; 
        }
    }
}

function showsumcol() {

    var textcol = "Showing sum of RSS values in dBm per column" + "<br>";

    textcol = textcol + "<ol> ";
    for (var i = 0; i < 20; i++) {
        textcol = textcol + "<li> " + sumofbeaconsreadingsincol[i] + "</li> ";
    }
    textcol = textcol + "</ol> ";

    document.getElementById("sumofcolshow").innerHTML = textcol;

    var x = document.getElementById("sumofcolshow");
    if (x.style.display === "none") {
        x.style.display = "block";

    } else {
        x.style.display = "none";
    }
}

function calcwttable() {
    for (j = 0; j <= 22; j++) {
        for (i = 0; i <= 14; i++) {
            if (j == 0) {
                weighttable[i][j] = mwrss[i][j]; 
            } else if (j == 1) {
                weighttable[i][j] = mwrss[i][j];
            } else if (j == 2) {
                weighttable[i][j] = mwrss[i][j];
            } else {
                if (sumofbeaconsreadingsincol[j-3]!=0) {
                    weighttable[i][j] = mwrss[i][j] / sumofbeaconsreadingsincol[j - 3];
                }
                
            }
        }
    }
    //document.getElementById("showweighttable").innerHTML = "jjj";
}

function showweighttable() {
    text = "Showing weights of the various beacons" + "<br>";

    text = text + "<ol> ";

    for (var i = 0; i < 15; i++) {
        text = text + "<li> ";
        for (var j = 0; j < 23; j++) {
            text = text + weighttable[i][j] + " ; ";
        }
        text = text + "</li> ";
    }
    text = text + "</ol> ";
    document.getElementById("showweighttable").innerHTML = text;

    var x = document.getElementById("showweighttable");
    if (x.style.display === "none") {
        x.style.display = "block";

    } else {
        x.style.display = "none";
    }
}

function calcxy() {
    for (var j = 3; j <= 22; j++) {
        for (var i = 0; i <= 14; i++) {
            arrx[j - 3] = arrx[j - 3] + weighttable[i][j] * weighttable[i][1];
            arry[j - 3] = arry[j - 3] + weighttable[i][j] * weighttable[i][2];;
        }
    }
}

function showxy() {

    xx = 0;
    yy = 0;




    for (var i = 0; i < 20; i++) {
        xx = xx + arrx[i];
        yy = yy + arry[i];
    }

    xx = xx / 20;
    yy = yy / 20;

    text = "Showing the possible X and Y (20 values)" + "<br>";

    text = text + "<ol> ";

    for (var i = 0; i < 20; i++) {
        text = text + "<li> X :  " + arrx[i] + "  Y :  " + arry[i] + " </li> ";
    }

    text = text + "</ol> ";

    text = text + " Average X and Y is : " + "<br>";
    text = text + "  X : " + xx + " &&  Y : " + yy + "<br>";

    document.getElementById("showxy").innerHTML = text;

    var x = document.getElementById("showxy");
    if (x.style.display === "none") {
        x.style.display = "block";

    } else {
        x.style.display = "none";
    }
}

// This finds the average of the x and y values 
function findxandyavg(){

    xx = 0;
    yy = 0;


    for (var i = 0; i < 20; i++) {
        xx = xx + arrx[i];
        yy = yy + arry[i];
    }

    xx = xx / 20;
    yy = yy / 20;

}


// This function calculates the scores of all the rooms and assigns them to the map and the array
function calcroom() {

    score = 0;

    // This map will store the scores for the rooms
    //var m = new Map();

    m.clear();

    for (var i = 0; i <= 47; i++) {
        score = 0;
        for (var j = 1; j <= 4; j++) {
            if (j == 1)
                score = score + Math.abs( ( xx + avgbx ) - roommatrix[i][j]);
            else if (j == 2)
                score = score + Math.abs( ( xx + avgbx) - roommatrix[i][j]);
            else if( j == 3 )
                score = score + Math.abs( ( yy + avgby) - roommatrix[i][j]);
            else if(j==4)
                score = score + Math.abs( ( yy + avgby) - roommatrix[i][j]);
        }
        m.set(roommatrix[i][0], score);
        scorearr[i] = score; 
    }

    
}

// This function displays the scorearr and the most probable room
function showroom() {

    min = scorearr[0];
    room = [0][0];

    for (i = 1; i <= 47; i++) {
        if (scorearr[i] < min) {
            min = scorearr[i];
            room = roommatrix[i][0];
        }
    }

    text = "The scores of the rooms are " + "<br>";

    text = text + "<ol> ";

    for (i = 0; i <= 47; i++) {
        text = text + "<li> Room : " + roommatrix[i][0] + " && score : " + scorearr[i] + "</li>";  
    }

    text = text + "</ol>";

    text = text + " The most appropriate room is " + room + "<br>";

    document.getElementById("showroom").innerHTML = text; 

    var x = document.getElementById("showroom");
    if (x.style.display === "none") {
        x.style.display = "block";

    } else {
        x.style.display = "none";
    }

}

// This function sorts the map in the ascending order of the values
function calcmap() {
    m[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((a, b) => a[1] - b[1]);
    }
}

// This shows the entire map after it is sorted if it is shown after the sorting is done or it shows the normal way if the sorting is not done
function showmap() {

    text = "The map entries are " + "<br>";

    text = text + "<ol>";

    for (let [k, v] of m) {
        text = text + "<li> Room : " + k + " && Score : " + v + "</li>";    
    }

    text = text + "</ol>";

    document.getElementById("showmap").innerHTML = text;

    var x = document.getElementById("showmap");
    if (x.style.display === "none") {
        x.style.display = "block";

    } else {
        x.style.display = "none";
    }

}

// This shows the final result to our user
function showfinalresult() {

    count = 0;

    text = "<b>You are near rooms : </b>" + "<br>"; 

    text = text + "<ol>";

    for (let [k, v] of m) {
        if (count <= 3) {
            text = text + "<li><b><u> Room</b></u> : " + k + "</li>";
            count++;
        }
        
    }

    text = text + "</ol>";

    count = 0;

    text = text + "<br>";

    text = text + "Your coordinates are <b> X : </b> " + (xx + avgbx) + " && <b> Y : </b> " + (yy + avgby) + "<br>";

    if (indexmovavg <=3 ){
    xmovavg[indexmovavg] = xx + avgbx;
    ymovavg[indexmovavg] = yy + avgby;
    indexmovavg++;
    }

    document.getElementById("showfinalresult").innerHTML = text;

    var x = document.getElementById("showfinalresult");
    if (x.style.display === "none") {
        x.style.display = "block";

    } else {
        x.style.display = "none";
    }

}

// The final button which will do all our calculations
function doallcalc() {

    shiftcoordinates();
       
    calcRSSmw();
        
    calcsumcol();

    calcwttable();

    calcxy();

    findxandyavg();

    calcroom();

    calcmap();

    showfinalresult();

}

// This function will calculate our moving average
function calcmovavg() {

    var curr_avgx, prev_avgx, curr_avgy, prev_avgy, threshold = 0.1;

    /*
    curr_avgx = (xmovavg[0] + xmovavg[1]) / 2;
    curr_avgy = (ymovavg[0] + ymovavg[1]) / 2;
    prev_avgx = curr_avgx;
    prev_avgy = curr_avgy;
    curr_avgx = (prev_avgx + xmovavg[2]) / 2;
    curr_avgy = (prev_avgy + ymovavg[2]) / 2;
    prev_avgx = curr_avgx;
    prev_avgy = curr_avgy;
    curr_avgx = (prev_avgx + xmovavg[3]) / 2;
    curr_avgy = (prev_avgy + ymovavg[3]) / 2;
    prev_avgx = curr_avgx;
    prev_avgy = curr_avgy;
    */

    // These arrays will store the moving average results for the x and y coordinates
    var arrxmovavg = [];
    var arrymovavg = [];
        
    for (var i = 0; i <= 200; i++) {
        arrxmovavg[i] = 0;
        arrymovavg[i] = 0;
    }

    // This calculates the starting of the moving average
    arrxmovavg[0] = (xmovavg[0] + xmovavg[1]) / 2;
    arrymovavg[0] = (ymovavg[0] + ymovavg[1]) / 2;
    arrxmovavg[1] = (xmovavg[2] + arrxmovavg[0]) / 2;
    arrymovavg[1] = (ymovavg[2] + arrymovavg[0]) / 2;
    arrxmovavg[2] = (xmovavg[3] + arrxmovavg[1]) / 2;
    arrymovavg[2] = (ymovavg[3] + arrymovavg[1]) / 2;

    // This loop will calculate the moving average
    for (var i = 3; i <= 200; i++) {
        arrxmovavg[i] = ( arrxmovavg[i - 1] + arrxmovavg[i - 3] )/2;
        arrymovavg[i] = ( arrymovavg[i - 1] + arrymovavg[i - 3] )/2;
    }

    text = "Your moving avg coordinates are <b> X : </b> " + arrxmovavg[200] + " && <b> Y : </b> " + arrymovavg[200] + "<br>";

    document.getElementById("showmovavg").innerHTML = text;

    var x = document.getElementById("showmovavg");
    if (x.style.display === "none") {
        x.style.display = "block";

    } else {
        x.style.display = "none";
    }

}
