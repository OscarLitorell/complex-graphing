/*

    Copyright Oscar Litorell 2019

*/

class Complex {
    constructor(re=0, im=0) {
        this.re = Number(re);
        this.im = Number(im);    
    }

    print() {
        return `${this.re} + ${this.im}i`;
    }

    static fromPolar(r, theta) {
        let re = r * Math.cos(theta);
        let im = r * Math.sin(theta);
        return new Complex(re, im);
    }


    static add(num1, num2) {
        if (num1.constructor !== Complex) num1 = new Complex(num1);
        if (num2.constructor !== Complex) num2 = new Complex(num2);

        let out = new Complex();
        out.re = num1.re + num2.re;
        out.im = num1.im + num2.im;
        return out;
    }

    static subtract(num1, num2) {
        if (num1.constructor !== Complex) num1 = new Complex(num1);
        if (num2.constructor !== Complex) num2 = new Complex(num2);

        let out = new Complex();
        out.re = num1.re - num2.re;
        out.im = num1.im - num2.im;
        return out;
    }

    static multiply(in1, in2) {
        if (in1.constructor !== Complex) in1 = new Complex(in1);
        if (in2.constructor !== Complex) in2 = new Complex(in2);
        let num1 = in1.re * in2.re;
        let num2 = in1.im * in2.re;
        let num3 = in1.re * in2.im;
        let num4 = in1.im * in2.im;

        let out = new Complex();

        out.re = num1 - num4;
        out.im = num2 + num3;
        return out;
    }

    static divide(num1, num2) {
        if (num1.constructor !== Complex) num1 = new Complex(num1);
        if (num2.constructor !== Complex) num2 = new Complex(num2);
        num2 = Complex.raise(num2, -1);
        return Complex.multiply(num1, num2);
    }

    static ln(num1) {
        if (num1.constructor !== Complex) num1 = new Complex(num1);
        let polar = Complex.toPolar(num1);
        return new Complex(Math.log(polar.r), polar.theta);
    }

    static raise(num1, num2) {
        if (num1.constructor !== Complex) num1 = new Complex(num1);
        if (num2.constructor !== Complex) num2 = new Complex(num2);

        if (Complex.abs(num1).re === 0 && Complex.abs(num2).re !== 0) {
            return new Complex(0);
        }

        let num1Polar = Complex.toPolar(num1);

        // Absolute value and argument of base (this)
        let absB = num1Polar.r;
        let argB = num1Polar.theta;
        
        let out = Complex.fromPolar(Math.exp(num2.re * Math.log(absB) - num2.im * argB), num2.im * Math.log(absB) + num2.re * argB);

        return out;
    }

    static abs(num) {
        return new Complex(Complex.toPolar(num).r);
    }

    static toPolar(num) {
        let r = Math.pow(Math.pow(num.re, 2) + Math.pow(num.im, 2), 0.5);
        let theta = Math.atan2(num.im, num.re);
        return {
            r: r,
            theta: theta
        };
    }

    // The following methods may be deprecated in the future
    added(num) {
        return Complex.add(this, num);
    }

    subtracted(num) {
        return Complex.subtract(this, num);
    }

    multipliedBy(num) {
        return Complex.multiply(this, num);
    }

    dividedBy(num) {
        return Complex.divide(this, num);
    }

    raisedTo(num) {
        return Complex.raise(this, num);
    }

}

class LineStyle {
    constructor(width, color) {
        this.width = width;
        this.color = color;
    }
}

class Vector {
    constructor(x=0, y=0, z=0) {
        this.x = Number(x);
        this.y = Number(y);
        this.z = Number(z);
    }

    addVector(vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
    }

    added(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    }
	
	subtracted(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    }
}

class View {
    constructor(longitude = 0, latitude = 0, offset = new Vector(0, 0, 0), zoom = 100) {
        this.longitude = longitude;
        this.latitude = latitude;
        this.offset = offset;
        this.zoom = zoom;
    }

    projectVector(vectorInput) {
        let x = 0;
        let y = 0;

        let vector = vectorInput.subtracted(this.offset);

        x += vector.x * Math.cos(this.longitude / 180 * Math.PI);
        x += vector.z * -Math.sin(this.longitude / 180 * Math.PI);

        y += vector.y * Math.cos(this.latitude / 180 * Math.PI);
        y += -Math.sin(this.latitude / 180 * Math.PI) * Math.sin(this.longitude / 180 * Math.PI) * vector.x;
        y += -Math.sin(this.latitude / 180 * Math.PI) * Math.cos(this.longitude / 180 * Math.PI) * vector.z;

        x *= this.zoom;
        y *= this.zoom;

        return new Vector(x, y);
    }
}


function drawCanvas3d(canvas, point1, point2, lineStyle, view) {
    let ctx = canvas.getContext("2d");
    let width = canvas.width;
    let height = canvas.height;
    let originalStyle = new LineStyle(ctx.lineWidth, ctx.strokeStyle);
    
    ctx.lineWidth = lineStyle.width;
    ctx.strokeStyle = lineStyle.color;

    let start = view.projectVector(point1);
    let end = view.projectVector(point2);
    start.x += width * 0.5;
    start.y = height * 0.5 - start.y;

    end.x += width * 0.5;
    end.y = height * 0.5 - end.y;
    
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.lineWidth = originalStyle.width;
    ctx.strokeStyle = originalStyle.color;
    
}


var lineStyle = new LineStyle(1, "#000000");

var mainCanvas = document.getElementById("maincanvas");

function drawAxisLines(canvas, view) {
    let width = canvas.width;
    let height = canvas.height;
    
    let pixelRatio = window.devicePixelRatio;


    drawCanvas3d(canvas, new Vector(-view.zoom, 0, 0), new Vector(0, 0, 0), new LineStyle(1 * pixelRatio, "#00FF00"), view);
    drawCanvas3d(canvas, new Vector(view.zoom, 0, 0), new Vector(0, 0, 0), new LineStyle(2 * pixelRatio, "#00FF00"), view);
    drawCanvas3d(canvas, new Vector(0, -view.zoom, 0), new Vector(0, 0, 0), new LineStyle(1 * pixelRatio, "#FF0000"), view);
    drawCanvas3d(canvas, new Vector(0, view.zoom, 0), new Vector(0, 0, 0), new LineStyle(2 * pixelRatio, "#FF0000"), view);
    drawCanvas3d(canvas, new Vector(0, 0, -view.zoom), new Vector(0, 0, 0), new LineStyle(1 * pixelRatio, "#0000FF"), view);
    drawCanvas3d(canvas, new Vector(0, 0, view.zoom), new Vector(0, 0, 0), new LineStyle(2 * pixelRatio, "#0000FF"), view);

    let ctx = canvas.getContext("2d");

    let xVector = view.projectVector(new Vector(1, 0, 0));
    let yVector = view.projectVector(new Vector(0, 1, 0));
    let zVector = view.projectVector(new Vector(0, 0, 1));
    ctx.font = `${20 * pixelRatio}px Arial`;
    ctx.fillText(".1", xVector.x + width * 0.5 - 2.5 * pixelRatio, -xVector.y + height * 0.5 + 1 * pixelRatio);
    ctx.fillText(".1", yVector.x + width * 0.5 - 2.5 * pixelRatio, -yVector.y + height * 0.5 + 1 * pixelRatio);
    ctx.fillText(".1", zVector.x + width * 0.5 - 2.5 * pixelRatio, -zVector.y + height * 0.5 + 1 * pixelRatio);

}


function drawFunction(canvas, begin, end, step = 0.1, view) {
    let pixelRatio = window.devicePixelRatio;

    let style   = new LineStyle(1   * pixelRatio, "#222222");
    let reStyle = new LineStyle(0.5 * pixelRatio, "#FF4444");
    let imStyle = new LineStyle(0.5 * pixelRatio, "#4444FF");
    
    let lastValue = resultList[0];
    for (let j = 0; j < lastValue.length; j++) {
        // Real component line
        drawCanvas3d(canvas, new Vector(begin, 0, 0), new Vector(begin, lastValue[j].re, 0), reStyle, view);

        // Imaginary component line
        drawCanvas3d(canvas, new Vector(begin, 0, 0), new Vector(begin, 0, lastValue[j].im), imStyle, view);
    }
    
    for (let i = 1; i <= (end - begin) / step; i++) {
        let x = i * step + begin
        
        //let result = func(new Complex(x, 0));
        let result = resultList[i];

        // Each element in the result
        for (let j = 0; j < result.length; j++) {
            // Function line
            drawCanvas3d(canvas, new Vector(x - step, lastValue[j].re, lastValue[j].im), new Vector(x, result[j].re, result[j].im), style, view);
            
            // Real component line
            drawCanvas3d(canvas, new Vector(x, 0, 0), new Vector(x, result[j].re, 0), reStyle, view);
            drawCanvas3d(canvas, new Vector(x - step, lastValue[j].re, 0), new Vector(x, result[j].re, 0), reStyle, view);
    
            // Imaginary component line
            drawCanvas3d(canvas, new Vector(x, 0, 0), new Vector(x, 0, result[j].im), imStyle, view);
            drawCanvas3d(canvas, new Vector(x - step, 0, lastValue[j].im), new Vector(x, 0, result[j].im), imStyle, view);
        }
        
        lastValue = result;
    }
}




var zoom = document.getElementById("zoom");
var xOffset = document.getElementById("x-offset");
var yOffset = document.getElementById("y-offset");
var zOffset = document.getElementById("z-offset");

var view = new View(40, 30, new Vector(xOffset.value, yOffset.value, zOffset.value), 100);

var resultList = [];


function updateView() {
    view.offset = new Vector(xOffset.value, yOffset.value, zOffset.value);
    updateCanvas();
}

//updateView();

xOffset.oninput = updateView;
yOffset.oninput = updateView;
zOffset.oninput = updateView;


function updateCanvas() {    
    mainCanvas.getContext("2d").clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    
    let minX = document.getElementById("minX").value;
    let maxX = document.getElementById("maxX").value;
    let resolution = Math.abs(document.getElementById("resolution").value);
    if (!resolution) resolution = 0.05;

    drawAxisLines(mainCanvas, view);

    drawFunction(mainCanvas, Math.min(minX, maxX), Math.max(minX, maxX), resolution, view);
}

function updateFunctionValues(func) {
    let begin = Number(document.getElementById("minX").value);
    let end = Number(document.getElementById("maxX").value);
    let step = Math.abs(document.getElementById("resolution").value);

    resultList = [];

    for (let i = 0; i <= (end - begin) / step; i++) {
        let x = i * step + begin
        let result = func(new Complex(x, 0));
        resultList.push(result);
    }
}





let operations = {
    "+": {args: 2, function: "add"},
    "-": {args: 2, function: "subtract"},
    "*": {args: 2, function: "multiply"},
    "/": {args: 2, function: "divide"},
    "^": {args: 2, function: "raise"},
    "ln": {args: 1, function: "ln"},
    "abs": {args: 1, function: "abs"}
};


let variableList = [
    {
        name: "pi",
        type: "constant",
        value: new Complex(Math.PI)
    },
    {
        name: "e",
        type: "constant",
        value: new Complex(Math.E)
    },

];

function getVariableIndex(name) {
    for (let i = 0; i < variableList.length; i++) {
        if (variableList[i].name === name) return i;
    }
    return -1;
}

// Parse a complex number string e.g. "4 - 3i" and return Complex value.
function parseNumber(num) {
    num = num.replace(/,/g, ".");
    num = num.replace(/\s/g, "");
    let numbers = [];

    let signs = "+-"

    let beginning = 0;
    for (let i = 1; i < num.length; i++) {
        if (signs.includes(num[i])) {
            numbers.push(num.substring(beginning, i));
            beginning = i;
        }
    }
    numbers.push(num.substring(beginning, num.length));

    let out = new Complex();
    
    for (let i = 0; i < numbers.length; i++) {
        let number = numbers[i];
        if ("iIjJ".includes(number[number.length - 1])) {
            // Imaginary
            let strNum = number.substring(0, number.length - 1);

            // If imaginary part has no number, assume it is one.
            if (strNum.length <= 1 && "+-".includes(strNum)) {
                if (strNum[0] === "-") {
                    out.im--;
                } else {
                    out.im++;
                }
            } else {
                out.im += Number(strNum);
            }
        } else {
            // Real
            out.re += Number(number);
        }
    }
    return out;
}


let functionText = "";


function updateFunction() {
    functionText = document.getElementById("function").value;
    updateFunctionValues(userFunction);
    updateCanvas();
}


function userFunction(num) {

    let functionList = functionText.split("\n").filter(line => line.trim() !== "");

    let functionStack = [];
    
    for (let i = 0; i < functionList.length; i++) {
        let line = functionList[i].trim();

        // Check if variable is x
        if (line === "x") {
            functionStack.push(num);

        // Check if line should be interpreted
        } else if (line !== "" && line [0] !== "#") {
            let variableIndex = getVariableIndex(line);
            
            if (operations.hasOwnProperty(line)) {
                // Operation
                let operation = operations[line];
                let values = functionStack.slice(functionStack.length - operation.args);
                let value = Complex[operation.function].apply(this, values);
                functionStack.length -= operation.args;
                functionStack.push(value);
                
            } else if (variableIndex !== -1) {
                // Variable
                functionStack.push(variableList[variableIndex].value);

            } else {
                // Constant
                functionStack.push(parseNumber(line));
            }
        }    
    }
    return functionStack;
}

let addVarElementBtn = document.getElementById("addVariableElement");


function addVariableElement() {
    variableList.push({
        name: "",
        type: "constant",
        value: new Complex(0, 0),

        min: 0,
        max: 1,
        step: 0.1

    });
    variableListToHTML();
}


function updateVariableList(event) {

    let element = event.target;
    
    let parent = element.parentElement;

    let index = Array.prototype.slice.call(parent.parentElement.children).indexOf(parent);

    let type = parent.children[1].value;

    variableList[index].type = type;

    variableList[index].name = parent.children[0].value

    switch (type) {
        case "constant":
            variableList[index].value = new Complex(parent.children[2].value, parent.children[3].value);
            break;
        case "range":
            variableList[index].value = new Complex((parent.children[3].value - parent.children[2].value) * parent.children[4].value * 0.005 + Number(parent.children[2].value));
            variableList[index].min = parent.children[2].value;
            variableList[index].max = parent.children[3].value;

            break;
        case "time":
            variableList[index].value = element.value;
            break;
    }

    variableListToHTML();
}


function updateVariableType(event) {

    let element = event.target;
    
    let parent = element.parentElement;

    let index = Array.prototype.slice.call(parent.parentElement.children).indexOf(parent);

    let type = parent.children[1].value;

    variableList[index].type = type;

    variableListToHTML();
}

var variableTypes = [
    "constant",
    "range",
    "time"
]


function deleteVariable(event) {

    let element = event.target;
    let parent = element.parentElement;

    let index = Array.prototype.slice.call(parent.parentElement.children).indexOf(parent);
    variableList.splice(index, 1);
    variableListToHTML();
    
}


function variableListToHTML() {
    let variableElement = document.getElementById("variable-list");
    variableElement.innerHTML = "";
    for (let i = 0; i < variableList.length; i++) {

        let htmlVariableElement = variableElement.appendChild(document.createElement("li"));
        htmlVariableElement.name = i;

        let html = "";
        let type = variableList[i].type;


        html += `Name: <input class="updateVariables" value="${variableList[i].name}">`
        html += `Type:<select class="updateVariableType">`;
        for (let j = 0; j < variableTypes.length; j++) {
            html += "<option";
            if (variableTypes[j] === type) {
                html += " selected";
            }
            html += ` value="${variableTypes[j]}">${variableTypes[j]}</option>`;
        }
        html += "</select>";

        switch (type) {
            case "constant":
                html += `
                Real part: <input class="updateVariables" type="number" value="${variableList[i].value.re}">
                Imaginary part: <input class="updateVariables" type="number" value="${variableList[i].value.im}">`;
                break;
            case "range":
                let value = variableList[i].value.re;
                value = Number((value + 1E-15).toFixed(13));
                html += `
                Min: <input class="updateVariables" type="number" value="${variableList[i].min}">
                Max: <input class="updateVariables" type="number" value="${variableList[i].max}">
                <input class="updateVariables" type="range" min="0" max="200" value="${200 * ((variableList[i].value.re - variableList[i].min) / (variableList[i].max - variableList[i].min))}">
                <span>${value}</span>`
                break;
            case "time":
                html += `
                Min: <input class="updateVariables" type="number" value="${variableList[i].min}">
                Max: <input class="updateVariables" type="number" value="${variableList[i].max}">
                Step: <input class="updateVariables" type="number" value="${variableList[i].step}">
                `

        }
        html += `<p class="button" onclick="deleteVariable(event)">Delete</p>`



        htmlVariableElement.innerHTML = html;
    }

    [].forEach.call(document.getElementsByClassName("updateVariables"), function (element) {
        
        if (element.type === "range") {
            element.oninput = function(event) {

                let element = event.target;

                let parent = element.parentElement;

                let index = Array.prototype.slice.call(parent.parentElement.children).indexOf(parent);
                let value = (parent.children[3].value - parent.children[2].value) * parent.children[4].value * 0.005 + Number(parent.children[2].value);
            
                variableList[index].value = new Complex(value);
                variableList[index].min = parent.children[2].value;
                variableList[index].max = parent.children[3].value;
                
                parent.children[5].innerHTML = Number((value + 1E-15).toFixed(13));
                updateFunctionValues(userFunction);
                updateCanvas();

            };
        }
        element.addEventListener("change", (event) => {
            updateVariableList(event);
        });
    });
    [].forEach.call(document.getElementsByClassName("updateVariableType"), function (element) {
        element.addEventListener("change", (event) => {
            updateVariableType(event);
        });

        updateFunctionValues(userFunction);
        updateCanvas();
    });
    updateFunctionValues(userFunction);
}



addVarElementBtn.addEventListener("click", addVariableElement);




mainCanvas.addEventListener("wheel", function(event) {
    event.preventDefault();    
    view.zoom = Math.pow(10, Math.log10(view.zoom) - event.deltaY * 0.001);
    updateCanvas();
    
});



mainCanvas.addEventListener("mousedown", rotateGraph);
mainCanvas.addEventListener("touchstart", rotateGraph);

var originalX;
var originalY;
var originalDistance;

function rotateGraph(event) {

    let originalLongitude;
    let originalLatitude;

    if (event.offsetX) {
        originalX = event.offsetX;
        originalY = event.offsetY;  
    } else {
        event.preventDefault();
        if (event.touches.length === 1) {
            originalX = event.touches[0].pageX;
            originalY = event.touches[0].pageY;
        } else {
            var originalZoom = view.zoom;
            originalX = (event.touches[0].pageX + event.touches[1].pageX) * 0.5;
            originalY = (event.touches[0].pageY + event.touches[1].pageY) * 0.5;
            originalDistance = Math.sqrt(Math.pow(event.touches[0].pageX - event.touches[1].pageX, 2) + Math.pow(event.touches[0].pageY - event.touches[1].pageY, 2));

        }
    }
    originalLatitude = view.latitude;
    originalLongitude = view.longitude;

    function mousemove(event) {
        view.longitude = originalLongitude - (event.offsetX - originalX) * 0.5;
        view.latitude = originalLatitude + (event.offsetY - originalY) * 0.5;
        updateCanvas();
    }

    function touchmove(event) {
        if (event.touches.length === 1) {
            var x = event.touches[0].pageX;
            var y = event.touches[0].pageY;    
        } else {
            var x = (event.touches[0].pageX + event.touches[1].pageX) * 0.5;
            var y = (event.touches[0].pageY + event.touches[1].pageY) * 0.5;

            let distance = Math.sqrt(Math.pow(event.touches[0].pageX - event.touches[1].pageX, 2) + Math.pow(event.touches[0].pageY - event.touches[1].pageY, 2));
            view.zoom = originalZoom * (distance / originalDistance);
        }



        view.longitude = originalLongitude - (x - originalX) * 0.5;
        view.latitude = originalLatitude + (y - originalY) * 0.5;
        
        updateCanvas();
    }

    mainCanvas.addEventListener("mousemove", mousemove);
    mainCanvas.addEventListener("mouseup", function() {
        mainCanvas.removeEventListener("mousemove", mousemove);
    })

    mainCanvas.addEventListener("touchmove", touchmove);
    mainCanvas.addEventListener("touchend", function(event) {
        if (event.touches.length === 0) {
            mainCanvas.removeEventListener("touchmove", touchmove);
        } else {
            originalX = event.touches[0].pageX;
            originalY = event.touches[0].pageY;
            
            originalLatitude = view.latitude;
            originalLongitude = view.longitude;
        }
    })
   

}

function isFullscreen() {
    return document.fullscreenElement !== null;
}

function resize() {
    let pixelRatio = window.devicePixelRatio;

    if (isFullscreen()) {
        let width = window.innerWidth * pixelRatio;
        let height = window.innerHeight * pixelRatio;
        
        mainCanvas.width = width;
        mainCanvas.height = height;

    } else {
        let width = mainCanvas.offsetWidth;
        let viewportHeight = window.innerHeight;

        mainCanvas.width = width * pixelRatio;
        mainCanvas.height = viewportHeight * 0.7 * pixelRatio;
    }

    updateCanvas();
}

function fullscreen(event) {
    let pixelRatio = window.devicePixelRatio;
    window.removeEventListener("resize", resize);

    if (mainCanvas.requestFullscreen) {
        mainCanvas.requestFullscreen();
    } else if (mainCanvas.mozRequestFullScreen) { /* Firefox */
        mainCanvas.mozRequestFullScreen();
    } else if (mainCanvas.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        mainCanvas.webkitRequestFullscreen();
    } else if (mainCanvas.msRequestFullscreen) { /* IE/Edge */
        mainCanvas.msRequestFullscreen();
    }

    let width = window.innerWidth * pixelRatio;
    let height = window.innerHeight * pixelRatio;

    mainCanvas.width = width;
    mainCanvas.height = height;
    
    window.addEventListener("resize", resize);
}



window.addEventListener("resize", resize);

variableListToHTML();

resize();