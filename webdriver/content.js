let ctrlPressed = false;
let boundingBoxMode = false;
let boundingBoxCreateMode = false;
let bboxList = [];
let canvas = document.createElement("div");
let currImg;
let imgCount = 0;

class BoundBox {
    xInitial;
    yInitial;
    element;
    constructor(element) {
        this.element = element;
        this.xInitial = element.offsetLeft;
        this.yInitial = element.offsetTop;
    }
};

function loadCanvas(event) {
    let docBody = document.getElementsByTagName("body")[0];
    docBody.appendChild(canvas);
    canvas.style.position = "fixed";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.height = "100vh";
    canvas.style.width = "100vw";
    canvas.style.display = "none";
    canvas.style.zIndex = 998;
}

function startBoundingBox(event) {
    boundingBoxCreateMode = true;
    if (!(event.clientX >= currImg.getBoundingClientRect().left && event.clientX <= currImg.getBoundingClientRect().right) ||
        !(event.clientY >= currImg.getBoundingClientRect().top && event.clientY <= currImg.getBoundingClientRect().bottom)) {
        console.log(currImg);
        console.log(event.clientX.toString() + ", " + event.clientY.toString());
        console.log(currImg.getBoundingClientRect().left.toString() + " to " + (currImg.getBoundingClientRect().left + currImg.offsetWidth).toString());
        console.log(currImg.getBoundingClientRect().top.toString() + " to " + (currImg.getBoundingClientRect().top + currImg.offsetHeight).toString());
        alert ("Bounding box should be in the image boundaries!");
        boundingBoxCreateMode = false;
        return;
    }
    let bbox = document.createElement("div");
    let docBody = document.getElementsByTagName("body")[0];
    docBody.appendChild(bbox);
    bbox.style.zIndex = 999;
    bbox.style.position = "fixed";
    bbox.style.top = event.clientY.toString() + "px";
    bbox.style.left = event.clientX.toString() + "px";
    bbox.style.backgroundColor = "red";
    bbox.style.borderWidth = "1px";
    bbox.style.borderColor = "black";
    bbox.style.borderStyle = "solid";
    bbox.style.opacity = 0.4;
    bbox.setAttribute("id", "bounding-box-" + (bboxList.length+1).toString());
    bbox.setAttribute("class", "bounding-box");
    bboxList.push(new BoundBox(bbox));
    console.log(bbox);
}

function downloadImage() {
    // let imageBox = document.getElementById("islsp");
    // let imgList = imageBox.getElementsByTagName('img');
    // if(imgList.length == 0) {
    //     alert("No image to download!");
    //     return;
    // }
    // imageBox.style.border='5px brown solid';
    let boxList = document.getElementsByClassName("v4dQwb");
    if (boxList != undefined && boxList.length > 1) {
        let box = boxList[boxList.length-2];
        let image = box.getElementsByClassName("n3VNCb")[0];
        console.log(image.src);
        if(!image.src.startsWith("data")) {
            // Script to download the image
            currImg = image;
        }
    } else {
        alert("No image to download!");
    }
    
    // let imgLink = document.createElement("a");
    // imgLink.setAttribute("href", imgToDownload.src);
    // imgLink.setAttribute("download", "img");
    // imgLink.setAttribute("target", "_blank");
    // imgLink.click();
}

function handleMouseMovement(event) {
    if (boundingBoxMode && boundingBoxCreateMode && bboxList.length != 0) {
        let box = bboxList[bboxList.length-1];
        if (event.clientY > box.yInitial) {
            let cursorSim = Math.min(currImg.getBoundingClientRect().bottom, event.clientY)
            box.element.style.height = (cursorSim - box.yInitial).toString() + "px";
        } else {
            let cursorSim = Math.max(event.clientY, currImg.getBoundingClientRect().top);
            box.element.style.top = cursorSim.toString() + "px";
            box.element.style.height = (box.yInitial - cursorSim).toString() + "px";
        }

        if (event.clientX > box.xInitial) {
            let cursorSim = Math.min(currImg.getBoundingClientRect().right, event.clientX)
            box.element.style.width = (cursorSim - box.xInitial).toString() + "px";
        } else {
            let cursorSim = Math.max(currImg.getBoundingClientRect().left, event.clientX);
            box.element.style.left = cursorSim.toString() + "px";
            box.element.style.width = (box.xInitial - cursorSim).toString() + "px";
        }
    } 
}

function downloadContent() {
    let extension = currImg.src.slice(currImg.src.indexOf(".", currImg.src.length-6));
    // console.log(extension);
    let pascalAnnotation = '<annotation verified="yes">\n\t<folder>train_annotations</folder>\n\t<filename>img_' + 
                           imgCount.toString() + extension + '</filename>\n\t<source>\n\t\t<database>Unknown</database></source>' +
                           '\n\t<size>\n\t\t<width>' + currImg.naturalWidth.toString() + '</width>\n\t\t<height>' + 
                           currImg.naturalHeight.toString() + '</height>\n\t\t<depth>3</depth>\n\t</size>\n\t<segmented>0</segmented>\n';
    pascalAnnotation += (bboxList.length > 0) ? '' : '';
    for (let box of bboxList) {
        let xMin = Math.round(box.element.offsetLeft - currImg.getBoundingClientRect().left);
        let xMax = Math.round(xMin + box.element.offsetWidth);
        let yMin = Math.round(box.element.offsetTop - currImg.getBoundingClientRect().top);
        let yMax = Math.round(yMin + box.element.offsetHeight);
        pascalAnnotation += '\t<object>\n\t\t<name>tent</name>\n\t\t<pose>Unspecified</pose>\n\t\t<truncated>0</truncated>\n\t\t' +
                            '<difficult>0</difficult>\n\t\t<bndbox>\n\t\t\t<xmin>' + xMin.toString() + '</xmin>\n\t\t\t' +
                            '<ymin>' + yMin.toString() + '</ymin>\n\t\t\t<xmax>' + xMax.toString() + '</xmax>\n\t\t\t<ymax>' +
                            yMax.toString() + '</ymax>\n\t\t</bndbox>\n\t</object>\n' 
        box.element.remove();
    }
    pascalAnnotation += '</annotation>';

    chrome.runtime.sendMessage({
        type: "download",
        downloadType: "image",
        data: currImg.src,
        filename: "image_" + imgCount.toString() + extension
    });
    
    chrome.runtime.sendMessage({
        type: "download",
        downloadType: "text",
        data: pascalAnnotation,
        filename: "image_" + imgCount.toString() + '.xml'
    });
    imgCount++;
}

document.addEventListener("keydown", event => {
    if(event.code == "ControlLeft") {
        ctrlPressed = true;
    }
    if (event.code == "KeyB" && ctrlPressed) {
        if (!boundingBoxMode) {
            downloadImage();
            canvas.style.display = "block";
            boundingBoxMode = true;
        }
        else {
            boundingBoxMode = false;
            boundingBoxCreateMode = false;
            canvas.style.display = "none";
            downloadContent();
        }
    } else if (event.code == "KeyX" && ctrlPressed) {
        if (boundingBoxCreateMode && boundingBoxMode) {
            boundingBoxCreateMode = false;
            bboxList[bboxList.length-1].element.remove();
            bboxList[bboxList.length-1].pop();
        } else if (!boundingBoxCreateMode && boundingBoxMode) {
            boundingBoxMode = false;
            canvas.style.display = "none";
            for (let box of bboxList)
                box.element.remove();
        }
    }
});

document.addEventListener("keyup", event => {
    if(event.code == "ControlLeft") {
        ctrlPressed = false;
    }
});

document.addEventListener("mousedown", event => {
    if (boundingBoxMode) {
        startBoundingBox(event);
        
    }
});

document.addEventListener("mouseup", event => {
    if (boundingBoxMode && boundingBoxCreateMode)
        boundingBoxCreateMode = false;
});

document.onmousemove = handleMouseMovement;

window.onload = loadCanvas;