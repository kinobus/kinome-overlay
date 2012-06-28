var KO= {};     // KO-global scope

KO.div = d3.select("body").append("div")
    .attr("id", "KOdiv")
    .attr("height", 975);

KO.opac = 0.55;      // fill-opacity of scatterplot points

KO.svg = KO.div     // main svg element
    .append("svg")
    .attr("width", 825)
    .attr("height", 975)
    .style("background-image", "url(img/KinomePoster4.jpg)")
    .style("background-size", "100% 100%");

KO.scale = 0.25;    // scaling factor of image (vs original 3300x4956 jpg

KO.coords = [];     // closure
KO.points = {};

KO.ExportImg = d3.select("#export").on("mousedown", function() {
    alert("Sorry, this feature is not yet available.");
});     // Export image

// Sliders for manipulating radius differentiation
KO.Slider = [ d3.select("#slider0"), d3.select("#slider1") ];

/* populate KO.coords table
 * import coords.json file */
d3.json("kotable.json", function(json) {
    KO.coords = json;
    /* generate static kinase endpoints */
    KO.points =  KO.svg.selectAll("circle")
        .data(KO.coords)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return parseFloat(d.xcoord) * KO.scale; })
        .attr("cy", function(d) { return parseFloat(d.ycoord) * KO.scale; })
        .attr("r", 2)
        .style("fill", "white")
        .style("stroke", 1);
});

// Plotted node label group
KO.LabelGrp = KO.svg.append("g");

/* return x-coord given input geneid string
 */
KO.getCoordX = function(geneid_in) {
    for (i = 0; i < KO.coords.length; i++) {
        if (KO.coords[i].GeneID == geneid_in)        // change to geneID
            return parseInt(KO.coords[i].xcoord) * KO.scale;
    }
    return null;    // geneID not found
};

/* return y-coord given input geneid string
 */
KO.getCoordY = function(geneid_in) {
    for (i = 0; i < KO.coords.length; i++) {
        if (KO.coords[i].GeneID == geneid_in)        // change to geneID
            return parseInt(KO.coords[i].ycoord) * KO.scale;
    }
    return null;    // geneID not found
};

/* return HGNC Name of the GeneID */
KO.getHGNC = function(gene_id) {
    for (i = 0; i < KO.coords.length; i++) {
        if (KO.coords[i].GeneID == gene_id)
            return KO.coords[i].HGNCSymbol;
    }
    return null;    // match not found
};

KO.reader = new FileReader();
KO.iValPtGrp = [];

/* on file upload */
KO.inputFileHandler = function(evt) {

    //var files = evt.target.files;   // FileList obj
    var files = document.getElementById("KOfiles").files;

    // closure, needed to read in file
    KO.reader.onload = function(e) {
        // Parse csv file
        var csvfile = d3.csv.parse(KO.reader.result);
        KO.iValPtGrp.push(KO.svg
                .append("g")
                .attr("id", KO.iValPtGrp.length));
        KO.iValPtGrp[KO.iValPtGrp.length - 1].selectAll("circle")
            .data(csvfile)
            .enter()
            .append("circle")
            .on("mouseover", function(d) {
                d3.select(this).style("fill-opacity", .8);
                KO.TooltipGrp.attr("visibility", "visible");
                // KO.Tooltip.attr("x", event.pageX + 20)
                // .attr("y", event.pageY - 10);
                KO.TooltipText
                // .attr("x", event.pageX + 30)
                // .attr("y", event.pageY - 20)
                .attr("x", parseFloat(KO.getCoordX(d.GeneID)) + 20)
                .attr("y", parseFloat(KO.getCoordY(d.GeneID)))
                .text(function() {
                    return "Intensity: " + d.intensityVal; });
            })
            .on("mouseout", function() {
                d3.select(this).style("fill-opacity", KO.opac);
                KO.TooltipGrp.attr("visibility", "hidden");
            })
            .attr("id", function(d) { return d.GeneID; })
            .style("fill", function(d) {
                if (parseFloat(d.intensityVal) < 0) {
                    return "red";
                }
                else {
                    return "green";
                }
            })
            .style("fill-opacity", KO.opac)
            .attr("cx", function(d) {
                //console.log(KO.getCoordX([d.geneID]));
                return KO.getCoordX(d.GeneID);
            })
            .attr("cy", function(d) {
                //console.log(KO.getCoordY([d.geneID]));
                return KO.getCoordY(d.GeneID);
            })
            .attr("r", function(d) {
                return 7 * (2.5 ^ Math.abs(parseFloat(d.intensityVal)));
            });

    // Add labels
    KO.LabelGrp.selectAll("text")
        .data(csvfile)
        .enter()
        .append("text")
        .text(function(d) {
            return KO.getHGNC(d.GeneID);
        })
        .attr("x", function(d) {
            return parseFloat(KO.getCoordX(d.GeneID)) + 15;
        })
        .attr("y", function(d) {
            return parseFloat(KO.getCoordY(d.GeneID));
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px");

    KO.TooltipGrp = KO.svg.append("g")
        .attr("visibility", "hidden");

    KO.TooltipText = KO.TooltipGrp.append("text")
    .text("Testing tooltip")
    .attr("fill", "black")
    .attr("font-family", "sans-serif")
    .attr("font-size", "14px");

    };

    KO.reader.readAsText(files[0]);

};
document.getElementById("KOfiles").addEventListener("change", KO.inputFileHandler, false);

/*
 * TOREAD:
 * http://www.ncbi.nlm.nih.gov/pmc/articles/PMC3361704/?tool=pubmed
 * http://rnai.nih.gov/haystack/
 * http://jbx.sagepub.com/content/17/4/496.full
 */
