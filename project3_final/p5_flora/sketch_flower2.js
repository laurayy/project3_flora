// organic is used to store the list of instances of Organic objects that we will create
var organics = [];
// The variable change stores the rate of rotation and the y coordinate for noise later
var change, colorsPalette;


// Declare a "SerialPort" object
var serial;
var latestData = 0; // you'll use this to write incoming data to the canvas
var easing = 0.3;
var z = 0;

function setup() {


    // organic[0].show();
    // noLoop();


    ///////////////////////////////////////////////////////////////////    

    // Instantiate our SerialPort object
    serial = new p5.SerialPort();

    // Get a list the ports available
    // You should have a callback defined to see the results
    serial.list();

    // Assuming our Arduino is connected, let's open the connection to it
    // Change this to the name of your arduino's serial port
    serial.open("/dev/cu.usbmodem14331");

    // Here are the callbacks that you can register

    // When we connect to the underlying server
    serial.on('connected', serverConnected);

    // When we get a list of serial ports that are available
    serial.on('list', gotList);
    // OR
    //serial.onList(gotList);

    // When we some data from the serial port
    serial.on('data', gotData);
    // OR
    //serial.onData(gotData);

    // When or if we get an error
    serial.on('error', gotError);
    // OR
    //serial.onError(gotError);

    // When our serial port is opened and ready for read/write
    serial.on('open', gotOpen);
    // OR
    //serial.onOpen(gotOpen);

    // Callback to get the raw data, as it comes in for handling yourself
    //serial.on('rawdata', gotRawData);
    // OR
    //serial.onRawData(gotRawData);

    createCanvas(windowWidth, windowHeight);
    background(0, 255);
    change = 0;
    colorsPalette = [color(146, 167, 202, 30),
            color(186, 196, 219, 30),
            color(118, 135, 172, 30),
            color(76, 41, 81, 30),
            color(144, 62, 92, 30),
            color(178, 93, 119, 30),
            color(215, 118, 136, 30),
            color(246, 156, 164, 30), ];

    for (var i = 0; i < 110; i++) {
        organics.push(new Organic(0.1 + 1 * i, width / 2, height / 2, i * 1, i * random(90), colorsPalette[floor(random(8))]));
    }

}

// We are connected and ready to go
function serverConnected() {
    println("Connected to Server");
}

// Got the list of ports
function gotList(thelist) {
    println("List of Serial Ports:");
    // theList is an array of their names
    for (var i = 0; i < thelist.length; i++) {
        // Display in the console
        println(i + " " + thelist[i]);
    }
}

// Connected to our serial device
function gotOpen() {
    println("Serial Port is Open");
}

// Ut oh, here is an error, let's log it
function gotError(theerror) {
    println(theerror);
}

// There is data available to work with from the serial port
function gotData() {
    var currentString = serial.readLine(); // read the incoming string
    trim(currentString); // remove any trailing whitespace
    if (!currentString) return; // if the string is empty, do no more
    console.log(currentString); // println the string
    latestData = currentString; // save it for the draw method
}

// We got raw from the serial port
function gotRawData(thedata) {
    println("gotRawData" + thedata);
}

// Methods available
// serial.read() returns a single byte of data (first in the buffer)
// serial.readChar() returns a single char 'A', 'a'
// serial.readBytes() returns all of the data available as an array of bytes
// serial.readBytesUntil('\n') returns all of the data available until a '\n' (line break) is encountered
// serial.readString() retunrs all of the data available as a string
// serial.readStringUntil('\n') returns all of the data available as a string until a specific string is encountered
// serial.readLine() calls readStringUntil with "\r\n" typical linebreak carriage return combination
// serial.last() returns the last byte of data from the buffer
// serial.lastChar() returns the last byte of data from the buffer as a char
// serial.clear() clears the underlying serial buffer
// serial.available() returns the number of bytes available in the buffer
// serial.write(somevar) writes out the value of somevar to the serial device



/////////////////////////////////////////////////////////////////////////////


function draw() {
    background(0, 0, 0, 30);
    for (var i = 0; i < organics.length; i++) {
        organics[i].show(change);
    }

    change += 0.01;

    /////////////////////////////////////////////////////////////////////////////    
    //    var targetr = latestData * 3;
    //    var dr = targetr - z;
    //    z += dr * easing;
    //    fill(0, 0, 0);
    //    text(latestData, 10, 10);
    //    colorMode(HSB, 100);
    //    fill(latestData, 100, 100);
    //    ellipse(innerWidth / 2, innerHeight / 2, z, z);

    // Polling method
    /*
  if (serial.available() > 0) {
  var data = serial.read();
  ellipse(50,50,data,data);
}
*/

}


function Organic(radius, xpos, ypos, roughness, angle, color) {

    this.radius = radius; //radius of blob
    this.xpos = xpos; //x position of blob
    this.ypos = ypos; // y position of blob
    this.roughness = roughness; // magnitude of how much the circle is distorted
    this.angle = angle; //how much to rotate the circle by
    this.color = color; // color of the blob

    this.show = function (change) {

        noStroke(); // no stroke for the circle
        // strokeWeight(0.1); //We can use this to set thickness of the stroke if necessary
        // stroke(200); //We can use this to set the color of the stroke if necessary
        fill(this.color); //color to fill the blob

        push(); //we enclose things between push and pop so that all transformations within only affect items within
        translate(xpos, ypos); //move to xpos, ypos
        rotate(this.angle + change); //rotate by this.angle+change
        beginShape(); //begin a shape based on the vertex points below
        //The lines below create our vertex points
        var off = 0;

        for (var i = 0; i < TWO_PI; i += 0.1) {
            var offset = map(noise(off, change), 0, 1, -this.roughness, this.roughness);
            var r = this.radius + offset * latestData / 10;
            var x = r * cos(i);
            var y = r * sin(i);
            vertex(x, y);
            off += 0.1;
        }
        endShape(); //end and create the shape
        pop();

    }
}
