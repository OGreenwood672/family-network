// index.js


function getObjectFitSize(
    contains /* true = contain, false = cover */,
    containerWidth,
    containerHeight,
    width,
    height
  ) {
    var doRatio = width / height;
    var cRatio = containerWidth / containerHeight;
    var targetWidth = 0;
    var targetHeight = 0;
    var test = contains ? doRatio > cRatio : doRatio < cRatio;
  
    if (test) {
        targetWidth = containerWidth;
        targetHeight = targetWidth / doRatio;
    } else {
        targetHeight = containerHeight;
        targetWidth = targetHeight * doRatio;
    }
  
    return {
        width: targetWidth,
        height: targetHeight,
        x: (containerWidth - targetWidth) / 2,
        y: (containerHeight - targetHeight) / 2
    };
}

class FamilyNetwork {
    constructor(width = 300, height = 150, familyData, primary_csrd) {
        // Create a canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.data = familyData;
        this.primary = primary_csrd;
        this.nodes = {}

        this.R = 30;
        this.MARRIAGE_BUFFER = this.R * 2;
        this.HORIZONTAL_BUFFER = this.R * 3;
        this.VERTICAL_BUFFER = this.R * 4;
        

        if (!this.primary in Object.keys(this.data)) {
            throw Error("Primary CSRID not found in the data")
        }
    
        // Append the canvas to the body by default
        document.body.appendChild(this.canvas);
        this.canvas.style.objectFit = "contain";
    
        // this.ctx.webkitImageSmoothingEnabled=true;

        const dimensions = getObjectFitSize(
            true,
            this.canvas.clientWidth,
            this.canvas.clientHeight,
            this.canvas.width,
            this.canvas.height
        );

        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = dimensions.width * dpr;
        this.canvas.height = dimensions.height * dpr;

        // Get the 2D rendering context
        this.ctx = this.canvas.getContext('2d');

        // let ratio = Math.min(
        //     this.canvas.clientWidth / width,
        //     this.canvas.clientHeight / height
        // );
        this.ctx.scale(dpr, dpr);

    }
  
    // Method to clear the canvas
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  
    // Method to set a background color
    setBackgroundColor(color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  
    // Method to draw a rectangle
    drawNode(csrid, x, y, r, color = 'black') {
        x += this.canvas.width / 2;
        y += this.canvas.height / 2;
        console.log(x, y);
        console.log(this.canvas.width, this.canvas.height);
        this.ctx.beginPath();  // Start a new path for the node
        this.ctx.arc(x, y, r, 0, Math.PI * 2);  // Draw a circle at (x, y) with radius r
        this.ctx.fillStyle = color;  // Set the fill color
        this.ctx.fill();  // Fill the circle with the specified color
        this.ctx.closePath();  // Close the path
        this.drawText(csrid, x, y);
    }

    drawText(text, x, y, font = '16px Arial', color = 'black') {
        this.ctx.font = font;            // Set the font style and size
        this.ctx.fillStyle = color;      // Set the fill color
        this.ctx.textAlign = 'center';   // Align the text in the center
        this.ctx.textBaseline = 'middle'; // Vertically align the text in the middle
        this.ctx.fillText(text, x, y);   // Draw filled text at (x, y)
      }

    // Method to resize the canvas
    resize(width, height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    calculateNodes() {
        let rows = [(0, 0)]; // [(left, right)]

        this.nodes = {};
        this.nodes[this.primary] = [0, 0];


    }

    drawNodes() {
        for (const key in this.nodes) {
            this.drawNode(key, this.nodes[key][0], this.nodes[key][1], this.R);
        }
    }

}

// module.exports = FamilyNetwork;
  