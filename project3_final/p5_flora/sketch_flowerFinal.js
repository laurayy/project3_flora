//https://github.com/playgrdstar/p5_blob
//p5.js serial example

var organics = [];
var change, colorsPalette;
var font, fontsize = 20

// Declare a "SerialPort" object
var serial;
var latestData = 0;
var easing = 0.001;
var z = 0; //variables that control for the flower

function preload() {
	font = loadFont('OpenSans-Light.ttf');
}


function setup() {

	// Instantiate our SerialPort object
	serial = new p5.SerialPort();

	// Get a list the ports available
	// You should have a callback defined to see the results
	serial.list();

	// Assuming our Arduino is connected, let's open the connection to it
	serial.open("/dev/cu.usbmodem14331");

	// When we connect to the underlying server
	serial.on('connected', serverConnected);

	// When we get a list of serial ports that are available
	serial.on('list', gotList);

	// When we some data from the serial port
	serial.on('data', gotData);

	// When or if we get an error
	serial.on('error', gotError);

	// When our serial port is opened and ready for read/write
	serial.on('open', gotOpen);

	createCanvas(windowWidth, windowHeight);
	background(0, 255);
	textFont(font);
	textSize(fontsize);
	textAlign(CENTER, CENTER);

	change = 0;
	//colors for flower
	colorsPalette = [color(146, 167, 202, 30),
            color(158, 99, 232, 30),
            color(277, 83, 235, 30),
            color(105, 98, 255, 30),
            color(255, 79, 19, 30),
            color(158, 210, 232, 30),
            color(232, 32, 145, 30),
            color(247, 210, 232, 30), ];

	//randomly assigned the color order
	for (var i = 0; i < 110; i++) {
		organics.push(new Organic(0.1 + 1 * i, width / 2, height / 2, i * 1, i * random(90), colorsPalette[floor(random(8))]));
	}

}

function serverConnected() {
	println("Connected to Server");
}

function gotList(thelist) {
	println("List of Serial Ports:");
	for (var i = 0; i < thelist.length; i++) {
		println(i + " " + thelist[i]);
	}
}

function gotOpen() {
	println("Serial Port is Open");
}

function gotError(theerror) {
	println(theerror);
}

function gotData() {
	var currentString = serial.readLine(); // read the incoming string
	trim(currentString); // remove any trailing whitespace
	if (!currentString) return; // if the string is empty, do no more
	console.log(currentString); // println the string
	latestData = currentString; // save it for the draw method
}

function gotRawData(thedata) {
	println("gotRawData" + thedata);
}


/////////////////////////////////////////////////////////////////////////////

function draw() {
	background(0, 0, 0, 30);
	textAlign(CENTER);
	drawWords(width * .5);

	//keep the flower moving
	for (var i = 0; i < organics.length; i++) {
		organics[i].show(change);
	}

	change += 0.01;
}


function Organic(radius, xpos, ypos, roughness, angle, color) {

	this.radius = radius; //radius
	this.xpos = xpos; //x position
	this.ypos = ypos; // y position
	this.roughness = roughness; // magnitude of how much the circle is distorted
	this.angle = angle; //how much to rotate the circle by
	this.color = color; // color

	this.show = function (change) {

		noStroke(); //
		fill(this.color);

		push();
		translate(xpos, ypos); //move to xpos, ypos
		rotate(this.angle + change); //rotate by this.angle+change
		beginShape(); //begin a shape based on the vertex points below

		//use latestData to control the flower bloom
		var targetr = latestData / 200;
		var dr = targetr - z;
		z += dr * easing;

		//change of the flower
		var off = 0;
		for (var i = 0; i < TWO_PI; i += 0.1) {
			var offset = map(noise(off, change), 0, 1, -this.roughness * z / 2, this.roughness * z / 2);
			var r = this.radius + offset * z * 2;
			var x = r * cos(i);
			var y = r * sin(i);
			vertex(x, y);
			off += 0.1;
		}
		endShape(); //end and create the shape
		pop();
	}
}

function drawWords(x) {
	fill(255, 255, 255, 500 - latestData);
	text("Put your phone down... just for a minute", x, 300);
}
