var lsystem = "F++F++F";
var replace = ["F-F++F-F"];
var charact = ["F","+","-"];
var forwards = ["F"];
var stackRead = [];
var stackWrite = [];
var clockwise = ["+"];
var clockwiseAngle = [60];
var anticlockwise = ["-"];
var anticlockwiseAngle = [60];
var step = 100;
var ratio = 3;
var ruleNumber = 3;
var rainbowMode = false;
var backgroundColour;
var strokeColour;
var ids = ["lsys","step","ratio","bg-colour","stroke-colour","times"]; // For saving/loading

function setup() {
    var c = createCanvas(windowWidth*0.6, windowHeight-20);
    rescale();
    c.parent("myCanvas");
    colorMode(HSB,100);
    backgroundColour = color(100,0,100);
    strokeColour = color(0,0,0);
}

function rescale() {
    document.getElementById("posx").value = (windowWidth*0.6)/2 - step/2;
    document.getElementById("posy").value = (windowHeight-20)/2 - step/2;
    document.getElementById("posx").max = windowWidth*0.6;
    document.getElementById("posy").max = windowHeight-20;
}

function toggleRainbowMode() {
    rainbowMode = !rainbowMode;
    redraw();
}

function changeBackgroundColour() {
    var bgcolour = document.getElementById("bg-colour").value; // As a hex string.
    colorMode(RGB);
    backgroundColour = color('#'+bgcolour.toLowerCase());
    colorMode(HSB,100);
    redraw();
}

function changeStrokeColour() {
    var stroke = document.getElementById("stroke-colour").value; // As a hex string.
    colorMode(RGB);
    strokeColour = color('#'+stroke.toLowerCase());
    colorMode(HSB,100);
    redraw();
}

function windowResized() {
    resizeCanvas(windowWidth*0.6, windowHeight-20);
    rescale();
}

function applyIteration() {
    applyOptions();
    lsystem = iterate(lsystem,charact,replace);
    redraw();
}

function draw() {
    clear();
    if(rainbowMode) {
        background(color(0,0,0));
    } else {
        background(backgroundColour);
    }
    readLsystem(lsystem,step);
    noLoop();
}

function updateGUI(cl) {
    var block = document.getElementById(cl);
    if(["c","a"].indexOf(block.getElementsByClassName("typeOfInstruction")[0].value) != -1) {
        // We want angle!
        block.getElementsByClassName("angle")[0].removeAttribute("disabled");
    } else {
        // No we don't...
        block.getElementsByClassName("angle")[0].setAttribute("disabled",true);
    }
}

function applyOptions() {
    // Add that callback to lots of things
    charact = [];
    replace = [];
    forwards = [];
    stackRead = [];
    stackWrite = [];
    clockwise = [];
    clockwiseAngle = [];
    anticlockwise = [];
    anticlockwiseAngle = [];
    // For each rule:
    for(var i=1; i <= ruleNumber; i++) {
        // Add left to charact and right to replace
        // Check its type, and add to relevant box
        // If angle, add that also.
        var block = document.getElementById("rule"+i);
        var letter = block.getElementsByClassName("charact")[0].value;
        charact.push(letter);
        replace.push(block.getElementsByClassName("replace")[0].value.split("|"));
        var typeo = block.getElementsByClassName("typeOfInstruction")[0].value;
        if(typeo == "f") {
            forwards.push(letter);
        } else if(typeo == "sr") {
            stackRead.push(letter);
        } else if(typeo == "sw") {
            stackWrite.push(letter);
        } else if(typeo == "c") {
            clockwise.push(letter);
            clockwiseAngle.push(int(block.getElementsByClassName("angle")[0].value));
        } else if(typeo == "a") {
            anticlockwise.push(letter);
            anticlockwiseAngle.push(int(block.getElementsByClassName("angle")[0].value));
        }
    }
}

function fullApply() {
    lsystem = document.getElementById("lsys").value;
    step = document.getElementById("step").value;
    ratio = document.getElementById("ratio").value;
    applyOptions();
    changeBackgroundColour();
    changeStrokeColour();
    redraw();
}

function iterate(lsystem,charact,replace) {
    step /= ratio;
    var newl = "";
    for (var i = 0; i < lsystem.length; i++) {
        var index = charact.indexOf(lsystem[i]);
        // For the whole extra replacement thing, randomly select from options
        if(index != -1) {
            newl += replace[index][Math.floor(Math.random() * replace[index].length)];
        }
    }
    return newl;
}

function readLsystem(lsystem,len) {
    var times = document.getElementById("times").value;
    var startl = lsystem;
    for(var i=0; i<times-1;i++) {
        lsystem += startl;
    }
    var currentDir = 0;
    var currentPos = [int(document.getElementById("posx").value),int(document.getElementById("posy").value)];
    var stack = [];
    var hue = 0;
    var forwardLength = forwards.join("");
    forwardLength = (lsystem.match(new RegExp("[" + forwardLength + "]","g")) || []).length;
    if(forwardLength == 0) alert("You're silly.");
    for (var i = 0; i < lsystem.length; i++) {
        if (forwards.indexOf(lsystem[i]) != -1) {
            // We've got a forwards symbol
            if(rainbowMode) {
                stroke(color(hue,100,100));
            } else {
                stroke(strokeColour);
            }
            hue += 100/forwardLength;
            var newx = currentPos[0] + len*cos(radians(currentDir));
            var newy = currentPos[1] - len*sin(radians(currentDir));
            line(currentPos[0],currentPos[1],newx,newy);
            currentPos = [newx,newy];
        }
        var cindex = clockwise.indexOf(lsystem[i]);
        if(cindex != -1) {
            // Do the clockwises
            currentDir -= clockwiseAngle[cindex];
        }
        var aindex = anticlockwise.indexOf(lsystem[i]);
        if(aindex != -1) {
            // Do the anticlockwises...?
            currentDir += anticlockwiseAngle[aindex];
        }
        var srindex = stackRead.indexOf(lsystem[i]);
        if(srindex != -1) {
            if(stack.length == 0) {
                alert("You're silly.");
            } else {
                var lastval = stack.pop();
                currentPos = lastval[0];
                currentDir = lastval[1];
            }
        }
        var swindex = stackWrite.indexOf(lsystem[i]);
        if(swindex != -1) {
            stack.push([currentPos,currentDir]);
        }
    }
}

function addRule() {
    ruleNumber += 1;
    var newrule = document.createElement("P");
    newrule.id = "rule" + ruleNumber;
    newrule.className = "rule";
    newrule.innerHTML = '<input type="text" class="charact" value="" size="1" /> : <input type="text" class="replace" value="" /> <select class="typeOfInstruction" onchange="updateGUI(\'rule' + ruleNumber + '\');"><option value="f" selected>Forwards</option><option value="sr">Stack Read</option><option value="sw">Stack Write</option><option value="c">Clockwise</option><option value="a">Anticlockwise</option></select> <input type="number" class="angle" value="60" size="3" disabled />';
    document.getElementById("rules").appendChild(newrule);
}

function removePreviousRule() {
    document.getElementById("rules").removeChild(document.getElementById("rule"+ruleNumber));
    ruleNumber--;
}

function makeSaveString() {
    var saveString = "";
    // Rainbow Mode:
    saveString += "rainbow=" + rainbowMode + ";";
    // Start with global options:
    for(var i=0; i < ids.length; i++) {
        var val = document.getElementById(ids[i]).value;
        saveString += ids[i] + "=" + val + ";";
    }
    // Now, replacement rules:
    for(var i=1; i <= ruleNumber; i++) {
        var block = document.getElementById("rule" + i);
        var letter = block.getElementsByClassName("charact")[0].value;
        var repl = block.getElementsByClassName("replace")[0].value;
        var typeo = block.getElementsByClassName("typeOfInstruction")[0].value;
        var angle = block.getElementsByClassName("angle")[0].value;
        saveString += letter + ":" + repl + ":" + typeo + ":" + angle + ";";
    }
    saveString = saveString.slice(0,-1);
    document.getElementById("savePlace").value = saveString;
}

function loadString() {
    for(var i=0;i<ruleNumber;i++) {
        removePreviousRule();
    }
    var saveString = document.getElementById("savePlace").value;
    if(saveString == "") {
        alert("You can't load an empty string!");
        return;
    }
    var parameters = saveString.split(";");
    var writtenRule = 0;
    for (var i = 0; i < parameters.length; i++) {
        var thing = parameters[i].split("=");
        if(thing.length == 1) {
            // It's a replacement rule!...
            writtenRule++;
            var block = document.getElementById("rule"+writtenRule);
            while(block == null) {
                addRule();
                block = document.getElementById("rule"+writtenRule);
            }
            // Now we need to apply our rule:
            thing = thing[0].split(":");
            block.getElementsByClassName("charact")[0].value = thing[0];
            block.getElementsByClassName("replace")[0].value = thing[1];
            block.getElementsByClassName("typeOfInstruction")[0].value = thing[2];
            block.getElementsByClassName("angle")[0].value = thing[3];
            updateGUI("rule"+writtenRule);
        } else if(thing.length == 2) {
            // These are global or rainbow! Yay, they win.
            if(thing[0] == "rainbow") {
                rainbowMode = (thing[1] == "true");
            } else {
                if(document.getElementById(thing[0]) != null) {
                    document.getElementById(thing[0]).value = thing[1];
                } else {
                    alert("This is silly.");
                    return;
                }
            }
        } else {
            alert("This is silly.");
            return;
        }
    }
    fullApply();
}

examples = [["rainbow=false;lsys=F++F++F;step=200;ratio=3;bg-colour=FFFFFF;stroke-colour=000000;F:F-F++F-F:f:60;+:+:c:60;-:-:a:60","Koch Snowflake"],["rainbow=true;lsys=FX;step=100;ratio=1.41;bg-colour=FF0000;stroke-colour=000000;F:F:f:60;+:+:c:90;-:-:a:90;X:X+YF+:f:60;Y:-FX-Y:f:60","Dragon Curve"],["rainbow=false;lsys=X;step=194;ratio=2;bg-colour=000000;stroke-colour=0DFF05;F:FF:f:60;+:+:c:25;-:-:a:25;X:F-[[X]+X]+F[+FX]-X:f:60;[:[:sw:60;]:]:sr:60","Fern"],["rainbow=false;lsys=B;step=200;ratio=2;bg-colour=0A0AFF;stroke-colour=FFF700;F:F:f:60;+:+:c:60;-:-:a:60;A:+B-A-B+:f:60;B:-A+B+A-:f:60","Sierpinski Triangle"],["rainbow=false;lsys=F++F++F;step=180;ratio=3;bg-colour=0800FF;stroke-colour=FFFFFF;F:F+F--F+F:f:60;+:+:c:60;-:-:a:60","Snowflake 2"],["rainbow=false;lsys=F++F++F;step=149;ratio=3;bg-colour=3D0CFF;stroke-colour=FFFFFF;times=3;F:F-F++F-F|F+F--F+F:f:60;+:+:c:60;-:-:a:60","Random Snowflake"],["rainbow=true;lsys=[F]+;step=149;ratio=3;bg-colour=3D0CFF;stroke-colour=FFFFFF;times=6;F:F-F++F-F|F+F--F+F:f:60;+:+:c:60;-:-:a:60;[:[:sw:60;]:]:sr:60","Random Spiral"],["rainbow=true;lsys=F;step=400;ratio=3;bg-colour=FFFFFF;stroke-colour=000000;times=1;F:F-F+F+F-F:f:60;+:+:c:90;-:-:a:90","Koch Right-Angled Curves"]];

// Generate examples list programatically.

function addExamples() {
    var resultHTML = "Load Example: <select class='examples' id='examples' onchange='loadExample();'>";
    for(var i = 0; i < examples.length; i++) {
        resultHTML += "<option value='" + examples[i][0] + "'>" + examples[i][1] + "</option>";
    }
    resultHTML += "</select>";
    document.getElementById("examples-div").innerHTML = resultHTML;
}

function loadExample() {
    document.getElementById("savePlace").value = document.getElementById("examples").value;
    loadString();
}
