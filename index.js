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

        this.R = 23;
    
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
        this.ctx.beginPath();  // Start a new path for the node
        this.ctx.arc(x, y, r, 0, Math.PI * 2);  // Draw a circle at (x, y) with radius r
        this.ctx.strokeStyle = color;  // Set the border color
        this.ctx.lineWidth = 3;  // Set the border width
        this.ctx.stroke();  // Draw the border (outline) of the circle
        this.ctx.closePath();
        this.drawText(csrid, x, y);
    }

    drawText(text, x, y, font = '12px Arial', color = 'black') {
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

    calculateNodes() { // Get parent node and work down
        let rows = {
            0: [0, 0]
        }

        this.nodes = {};
        // this.nodes[this.primary] = [0, 0];
        let queue = [[this.primary, 0]];
        let visited = [];

        const MARRIAGE_BUFFER = this.R * 3;
        const HORIZONTAL_BUFFER = this.R * 5;
        const VERTICAL_BUFFER = this.R * 4;

        while (queue.length > 0) {

            let [curr, depth] = queue.shift();

            if (visited.includes(curr)) {
                continue;
            }
            visited.push(curr); // Mark node as visited

            if (!Object.keys(rows).includes(depth)) {
                rows[depth] = [0, 0];
            }

            let y = depth * VERTICAL_BUFFER;

            let min_index = rows[depth].indexOf(Math.min(...rows[depth]));
            let x = Math.min(...rows[depth]) + (min_index * 2 - 1) * HORIZONTAL_BUFFER;

            if (visited.length == 1) {
                x = 0;
            } else {
                rows[depth][min_index] = Math.abs(x);
            }

            this.nodes[curr] = [x, y];

            let curr_conn = this.data[curr];
            let partners = curr_conn["married"];

            partners.forEach((elem) => {
                x = rows[depth][min_index] + (min_index * 2 - 1) * MARRIAGE_BUFFER;
                rows[depth][min_index] = Math.abs(x);
                this.nodes[elem] = [x, y];
            })

            let children = curr_conn["children"];
            children.forEach((child) => {
                queue.push([child, depth + 1])
            })

        }

        console.log(this.nodes)


    }

    drawNodes() {
        for (const key in this.nodes) {
            this.drawNode(key, this.nodes[key][0], this.nodes[key][1], this.R);
        }
    }

}

// module.exports = FamilyNetwork;
  