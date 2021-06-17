import * as d3 from 'd3';

var containerDiv = document.createElement("div");
containerDiv.style.display = 'inline-block';
containerDiv.style.position = 'relative';
document.body.appendChild(containerDiv);


(async () => {
    const response = await fetch('./data_files/design_space_data.json')
    const jsonString = await response.json()

    let data = jsonString as DesignSpaceData
    data.projects = data.projects.sort( (a,b) => a.genre > b.genre ? -1 : 1 )

    data.images = await imgDatas(data)

    let svgElement = constructGraphic(data)
    createSaveSVGButton(svgElement)
})()


const constructGraphic = (data: DesignSpaceData) => {
    const margin = ({top: 20, right: 20, bottom: 40, left: 40})
    const width = 1200
    const height = 840
    const color = "steelblue"


    const gridTopOffset = 80
    const dimsTopOffset = 60
    const gridLeftOffset = 150
    const gridSizeLarge = 18
    const gridSizeSmall = 14
    const gridRowOffset = 24
    const isUpOffset = 20
    const genreLeftOffset = 915
    const labelLeftOffset = 1010
    const legendLeftOffset = 10
    const legendTopOffset = 620


    let svg = d3.select(containerDiv)
        .append("svg")
        //.attr("viewBox", [0, 0, width, height]);
        .attr("viewBox", ([0, 0, width, height] as any));


    let projIdx = 0
    data.projects.forEach(function(project) {
        // PROJECT citekeys
        svg.append("text")
            .text(project.citekey)
            .attr("text-anchor", "end")
            .attr("fill", "grey")
            .attr("font-size", 12)
            .attr("x", 120)
            .attr("y", gridTopOffset + gridRowOffset * projIdx)


        // PROJECT genres
        svg.append("text")
            .text(project.genre)
            .attr("fill", "grey")
            .attr("font-size", 12)
            .attr("x", genreLeftOffset)
            .attr("y", gridTopOffset + gridRowOffset * projIdx)

        // PROJECT labels
        svg.append("text")
            .text(project.label)
            .attr("fill", "grey")
            .attr("font-size", 12)
            .attr("x", labelLeftOffset)
            .attr("y", gridTopOffset + gridRowOffset * projIdx)

        projIdx += 1
    })


    // DIMENSION NAMES at top
    let dimIdx = 0
    data.dimensions.forEach(function(dim) {
        const firstDimval = dim.name + dim.values[0]
        const firstDimvalIdx = getDimvalIndexFromDimval(firstDimval, data)

        const isUp: number = dimIdx % 2

        // text underline
        svg.append("rect")
            .attr("fill", "lightgray")
            .attr("width", gridSizeLarge)
            .attr("height", 2)
            .attr("x", gridLeftOffset + 30 * firstDimvalIdx)
            .attr("y", gridTopOffset - (dimsTopOffset - 5) + isUp * isUpOffset)

        // vertical line
        svg.append("rect")
            .attr("fill", "lightgray")
            .attr("width", 2)
            .attr("height", dimsTopOffset - 25 - isUp * isUpOffset)
            .attr("x", gridLeftOffset + 30 * firstDimvalIdx + gridSizeLarge / 2)
            .attr("y", gridTopOffset - (dimsTopOffset - 5) + isUp * isUpOffset)

        // dim binding line
        svg.append("rect")
            .attr("fill", "lightgray")
            .attr("width", (dim.values.length * gridRowOffset - 3) * 1.12)
            .attr("height", 2)
            .attr("x", gridLeftOffset + 30 * firstDimvalIdx)
            .attr("y", gridTopOffset - 20)

        // dimension name
        svg.append("text")
            .text(dim.name)
            .attr("fill", "grey")
            .attr("font-size", 12)
            .attr("x", gridLeftOffset + 30 * firstDimvalIdx)
            .attr("y", 3 + gridTopOffset - dimsTopOffset + isUp * isUpOffset)

        dimIdx += 1
    })


    // titles at top
    svg.append("text")
        .text("PROJECT")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .attr("font-size", 16)
        .attr("x", 120)
        .attr("y", gridTopOffset - 30)

    svg.append("text")
        .text("GENRE")
        .attr("text-anchor", "start")
        .attr("fill", "black")
        .attr("font-size", 16)
        .attr("x", genreLeftOffset)
        .attr("y", gridTopOffset - 30)

    svg.append("text")
        .text("LABEL")
        .attr("text-anchor", "start")
        .attr("fill", "black")
        .attr("font-size", 16)
        .attr("x", labelLeftOffset)
        .attr("y", gridTopOffset - 30)


    // EMPTY GRID RECTS
    let dimvalIdx = 0
    getAllDimvals(data).forEach(function(dimval) {
        projIdx = 0
        data.projects.forEach(function(project) {
            svg.append("rect")
                .attr("stroke", "lightgray")
                .attr("stroke-width", 2)
                .attr("fill", "white")
                .attr("opacity", 0.5)
                .attr("width", gridSizeLarge)
                .attr("height", gridSizeLarge)
                .attr("x", gridLeftOffset + 30 * dimvalIdx)
                .attr("y", gridTopOffset + gridRowOffset * projIdx - gridSizeLarge/2 - 5)

            projIdx += 1
        })
        dimvalIdx += 1
    })


    // ICONS IN RECTS
    projIdx = 0
    data.projects.forEach(function(project) {
        project.dimensionvalues.forEach(function(dimval) {
            svg.append("svg:image")
                .attr('width', gridSizeLarge)
                .attr('height', gridSizeLarge)
                .attr("x", gridLeftOffset + 30 * getDimvalIndexFromDimval(dimval, data))
                .attr("y", gridTopOffset + gridRowOffset * projIdx - gridSizeLarge/2 - 5)
                .attr("href", () => b64img(dimval, data))
        })
        projIdx += 1
    })


    // LEGEND
    svg.append("text")
        .text("LEGEND")
        .attr("fill", "black")
        .attr("font-size", 20)
        .attr("x", legendLeftOffset)
        .attr("y", legendTopOffset)

    dimIdx = 0
    data.dimensions.forEach(function(dim) {
        let valIdx = 0

        let dimText = dim.name

        if (dim.name === "physicalInterplayParallel") {
            dimText = "physInterpParallel"
        }
        if (dim.name === "physicalInterplayInterdependent") {
            dimText = "physInterpInterdep"
        }
        if (dim.name === "virtualInterplayParallel") {
            dimText = "virtuInterpParallel"
        }
        if (dim.name === "virtualInterplayInterdependent") {
            dimText = "virtuInterpInterdep"
        }

        svg.append("text")
            .text(dimText)
            .attr("fill", "black")
            .attr("font-size", 14)
            .attr("x", legendLeftOffset + 130 * dimIdx)
            .attr("y", legendTopOffset + 28)

        // underline
        svg.append("rect")
            .attr("fill", "black")
            .attr("width", 40)
            .attr("height", 2)
            .attr("x", legendLeftOffset + 130 * dimIdx)
            .attr("y", legendTopOffset + 35)

        dim.values.forEach(function(val) {
            svg.append("text")
                .text(val)
                .attr("fill", "grey")
                .attr("font-size", 12)
                .attr("x", legendLeftOffset + 25 + 130 * dimIdx)
                .attr("y", legendTopOffset + 65 + 30 * valIdx)

            svg.append("svg:image")
                .attr('width', gridSizeLarge)
                .attr('height', gridSizeLarge)
                .attr("x", legendLeftOffset + 130 * dimIdx)
                .attr("y", legendTopOffset + 50 + 30 * valIdx)
                .attr("href", b64img(dim.name + val, data))

            valIdx += 1
        })
        dimIdx += 1
    })

    return svg
}


// loads PNG (or other) images and stores them as base64 data strings
const imgDatas = async (data: DesignSpaceData): Promise<ImageDataB64[]> => {
    let imgDatas: ImageDataB64[] = []
    for (const dim of data.dimensions) {
        for (const val of dim.values) {
            const imgData = await imgDataFromDimval(dim.name + val, data)
            imgDatas.push(imgData)
        }
    }
    return imgDatas
}


const imgDataFromDimval = async (dimval: string, data: DesignSpaceData) => {
    const imgPath: string = getImagePathFromDimval(dimval, data)
    const response = await fetch(imgPath)
    const blob = await response.blob()
    const blobData = await dataFromBlob(blob)

    const imgDataB64: ImageDataB64 = {
        name: dimval,
        data: blobData
    }

    return imgDataB64
}


const dataFromBlob = async (blob: Blob) => {
    return new Promise<string>((resolve, reject) => {
        var reader = new FileReader()
        reader.onload = (event: any) => {
            resolve(event.target.result)
        }
        reader.readAsDataURL(blob)
    })
}


const getDimvalIndexFromDimval = (dimval: string, dsData: DesignSpaceData): number => {
    if (dimval.endsWith("None")) {
        const dimName = dimval.replace("None", "")
        const dimIdx = dsData.dimensions.map(dim => dim.name).indexOf(dimName)
        const dim: Dimension = dsData.dimensions[dimIdx]
        return getAllDimvals(dsData).indexOf(dim.name + dim.values[0])
    }

    return getAllDimvals(dsData).indexOf(dimval)
}


const getAllDimvals = (dsData: DesignSpaceData): string[] => {
    let allDimvals: string[] = []

    dsData.dimensions.map(dim => {
        dim.values.map(val => {
            allDimvals.push(dim.name + val)
        })
    })

    return allDimvals
}


// base64-encoded icon image
const b64img = (dimval: string, data: DesignSpaceData) => {
    const imgDataB64 = data.images.find(img => img.name === dimval)
    return imgDataB64.data
}


const getImagePathFromDimval = (
    dimval: string, dsData: DesignSpaceData
): string => {
    const dirPath = "./data_files/icons-assets/"
    const extension = ".png"

    if (dimval.endsWith("None")) {
        return dirPath + "nothingInDimension" + extension
    }

    if (getAllDimvals(dsData).indexOf(dimval) > -1) {
        return dirPath + dimval + extension
    }

    return dirPath + "invalidData" + extension
}


const getImagePaths = (
    dim: Dimension,
    project: ProjectInfo,
    dsData: DesignSpaceData
): string[] => {
    let imgPaths: string[] = []
    project.dimensionvalues.forEach(function(dimval) {
        imgPaths.push(getImagePathFromDimval(dimval, dsData))
    })
    return imgPaths
}


const saveSvg = (svgEl: HTMLElement, name: string) => {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    let svgData = svgEl.outerHTML;
    let preface = '<?xml version="1.0" standalone="no"?>\r\n';
    let svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    let svgUrl = URL.createObjectURL(svgBlob);
    let downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}


const createSaveSVGButton = (svgEl) => {
    let button = document.createElement("button");
    button.innerHTML = "Save SVG";
    button.addEventListener ("click", function() {
      saveSvg(svgEl.node(), 'test.svg')
    });
    containerDiv.insertBefore(button, containerDiv.firstChild);
}



function createLink(div: HTMLElement, path: string) {
    const a = document.createElement('a');
    const link = document.createTextNode(path);
    a.appendChild(link);
    a.title = path;
    a.href = path;
    //document.body.appendChild(a);
    div.insertBefore(a, div.firstChild);
}

createLink(containerDiv, '../index.html')


type DesignSpaceData = {
    dimensions: Dimension[],
    projects: ProjectInfo[],
    images: ImageDataB64[]
}

type ProjectInfo = {
    citekey: string,
    label: string,
    genre: string,
    dimensionvalues: string[]
}

type Dimension = {
    name: string,
    values: string[]
}

type ImageDataB64 = {
    name: string,
    data: string
}

