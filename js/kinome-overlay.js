/* KinomeOverlay.js
 * Copyright 2012 (c) Joseph Lee & Nick Robin
 * This software may be distributed under the MIT License
 * See file LICENSE for details
 *
 * http://code.google.com/p/kinome-overlay
 */

// Heavily used shortcut
pF = parseFloat;
abs = Math.abs;
pow = Math.pow;

(function ($) {
    $("#slope").slider({ min: 0, max: 10, step: 1, value: 5,
        slide: function(event, ui) {
            KVM.slope(ui.value);
            KVM.setRadii();
            KVM.force.resume()
        }
    });
    $("#yint").slider({ min: -100, max: 100, step: 1, value: 1,
        slide: function(event, ui) {
            KVM.yint(ui.value);
            KVM.setRadii();
            KVM.force.resume()
        }
    });
    $("#opac").slider({ min: 0.1, max: 1, step: .1, value: .8,
        slide: function(event, ui) {
            KVM.opac(ui.value);
            d3.selectAll(".data#pts")
                .style("fill-opacity", function(d) {
                    return ui.value;
                });
        }
    });

    $("#tabs").tabs();

    // Color picker
    function hexFromRGB(r, g, b) {
        var hex = [
            r.toString( 16 ),
            g.toString( 16 ),
            b.toString( 16 )
        ];
        $.each( hex, function( nr, val ) {
            if ( val.length === 1 ) {
                hex[ nr ] = "0" + val;
            }
        });
        return hex.join( "" ).toUpperCase();
    }
    // inhibitors
    $(".inh#red").slider({
        orientation: "horizontal",
        range: "min",
        max: 255,
        value: 57,
        slide: function(event, ui) {
            KVM.inhR(ui.value);
            KVM.setColors();
        },
        change: function(event, ui) {
            KVM.inhR(ui.value);
            KVM.setColors();
        }
    });
    $(".inh#green").slider({
        orientation: "horizontal",
        range: "min",
        max: 255,
        value: 39,
        slide: function(event, ui) {
            KVM.inhG(ui.value);
            KVM.setColors();
        },
        change: function(event, ui) {
            KVM.inhG(ui.value);
            KVM.setColors();
        }
    });
    $(".inh#blue").slider({
        orientation: "horizontal",
        range: "min",
        max: 255,
        value: 91,
        slide: function(event, ui) {
            KVM.inhB(ui.value);
            KVM.setColors();
        },
        change: function(event, ui) {
            KVM.inhB(ui.value);
            KVM.setColors();
        }
    });
    //activators
    $(".act#red").slider({
        orientation: "horizontal",
        range: "min",
        max: 255,
        value: 199,
        slide: function(event, ui) {
            KVM.actR(ui.value);
            KVM.setColors();
        },
        change: function(event, ui) {
            KVM.actR(ui.value);
            KVM.setColors();
        }
    });
    $(".act#green").slider({
        orientation: "horizontal",
        range: "min",
        max: 255,
        value: 153,
        slide: function(event, ui) {
            KVM.actG(ui.value);
            KVM.setColors();
        },
        change: function(event, ui) {
            KVM.actG(ui.value);
            KVM.setColors();
        }
    });
    $(".act#blue").slider({
        orientation: "horizontal",
        range: "min",
        max: 255,
        value: 0,
        slide: function(event, ui) {
            KVM.actB(ui.value);
            KVM.setColors();
        },
        change: function(event, ui) {
            KVM.actB(ui.value);
            KVM.setColors();
        }
    });

    // Demo button
    // SigmaLBarMean Demo
    $("#demo").button();
    $("#demo").click(function() {
        $.getJSON("data/SigmaLBarMean.json", function(demoData) {
            KVM.clearData();
            KVM.applyData(demoData);
        });
    });
 

    /**
     * Kinome
     * ViewModel
     */
    var KinomeViewModel = function() {
        var self = this;
        self.width = ko.observable(825);
        self.height = ko.observable(975);

        // radius scaling values
        self.slope = ko.observable(5);
        self.yint = ko.observable(0);

        // opacity
        self.opac = ko.observable(.8);

        // Observable color values
        self.inhR = ko.observable(57);
        self.inhG = ko.observable(39);
        self.inhB = ko.observable(91);

        self.actR = ko.observable(199);
        self.actG = ko.observable(153);
        self.actB = ko.observable(0);

        // svg elements
        self.svg = d3.select("#kinome");
        self.dataGrp = d3.select(".data#grp");


        // Color picker
        self.hexFromRGB = function (r, g, b) {
            var hex = [
                r.toString( 16 ),
                g.toString( 16 ),
                b.toString( 16 )
            ];
            $.each( hex, function( nr, val ) {
                if ( val.length === 1 ) {
                    hex[ nr ] = "0" + val;
                }
            });
            return hex.join( "" ).toUpperCase();
        };
        self.inhColor = ko.computed(function() {
            return "#" + self.hexFromRGB(self.inhR(),
                self.inhG(),
                self.inhB());
        });
        self.actColor = ko.computed(function() {
            return "#" + self.hexFromRGB(self.actR(),
                self.actG(),
                self.actB());
        });

        // Synchronously get kinase coordinates
        self.kinases = ko.observableArray([]);
        $.ajax({
            async: false,
            dataType: "json",
            url: "kotable.json",
            success: function(data) {
                while(data.length > 0) {
                    var temp = data.pop();
                    temp.x /= 4;
                    temp.y /= 4;
                    temp.Intensity = 0;
                    temp.fixed = true;
                    self.kinases.push(temp);
                }
            }
        });

        /* Upload file handle */
        self.userData = ko.observableArray();
        self.reader = new FileReader();

        // Event binding on View: input file-upload
        self.onFileUpload = function() {
            var upload_file = document.getElementById("csv_file").files;
            for (i = 0; i < upload_file.length; i++) {
                self.reader.readAsText(upload_file[i]);
            }
        };

        // Event triggered by finished file upload
        // called upon completion of reader.readAsText
        self.reader.onloadend = function(e) {

            // parse input data
            var data = self.reader.result.split("\n");
            for (i = 0; i < data.length; i++) {
                data[i] = data[i].split(",");
            }
            self.applyData(data);
        };

        // Return Kinase object by GeneID
        self.getKinaseById = function (geneid) {
            for (i = 0; i < self.kinases().length; i++) {
                if (self.kinases()[i].GeneID = geneid) {
                    return self.kinase()[i];
                }
            }
            return undefined;
        };

        // Return radius based on intensity
        self.getRadius = function (intensity) {
            var radius = self.slope() * intensity * (pow(-1, (intensity < 0))) + self.yint();
            return radius >= 0 ? radius : 0;
        };

        // obtain approriate color for intensity
        self.getColor = function (intensity) {
            if (intensity >= 0) {
                return self.actColor();
            }
            return self.inhColor();
        };

        // change all radii accordingly
        // use radius scaling events for data points
        self.setRadii = function() {
            d3.selectAll(".data#pts")
                .attr("r", function(d) {
                    return self.getRadius(d.Intensity);
                });
            // make labels disappear when datapt radius is zero
            d3.selectAll(".data#label")
                .attr("visibility", function(d) {
                    return self.getRadius(d.Intensity) > 0 ? "visible"
                        : "hidden";
                });
        };

        // change all colors accordingly
        // use color changing events for data points
        self.setColors = function() {
            d3.selectAll(".data#pts")
                .style("fill", function(d) {
                    return self.getColor(d.Intensity);
                });
        };

        // purge all intensity data from kinases
        self.clearData = function () {
            self.userData.removeAll();
            for (i = 0; i < self.kinases().length; i++) {
                self.kinases()[i].Intensity = 0;
            }
            self.userData.destroyAll();
        };


        // parse, plot user uploaded data
        // uses closure of self.userData
        // self.userData should be sufficiently parsed
        // to an array of 2-element arrays:
        // [ [ GeneID, intensity-value ], ... ]
        self.applyData = function (inputData) {
            // sort inputData so smaller radii are visible
            inputData.sort(function(left, right) {
                var l = abs(left[1]);
                var r = abs(right[1]);
                return l == r ? 0 : (l < r ? -1 : 1);
            });
            while (inputData.length > 0) {
                var temp = inputData.pop();
                for (i = 0; i < self.kinases().length; i++) {
                    if (self.kinases()[i].GeneID == temp[0]) {
                        self.kinases()[i].Intensity = temp[1];
                        self.userData.push(self.kinases()[i]);
                    }
                }
            }
            self.setForce();    // run force layout
        };

        /**
         * LABELS USING FORCES
         * Plot collision detecting labels using d3 force layout
         */

        self.setForce = function() {
            // establish data
            self.label = {};
            self.label.nodes = [];
            self.label.links = [];
            // shallow copies of userData
            for (i = 0; i < self.userData().length; i++) {
                self.label.nodes.push(self.userData()[i]);
            }
            // label info
            for (i = 0; i < self.userData().length; i++) {
                var temp = self.userData()[i];
                self.label.nodes.push({
                    "GeneID": temp.GeneID,
                    "KinaseName": temp.KinaseName,
                    "Intensity": temp.Intensity,
                    "fixed": false,
                    "x": temp.x,
                    "y": temp.y
                });
            }
            for (i = 0; i < self.userData().length; i++) {
                self.label.links.push({
                    "source": i,
                    "target": i + self.userData().length,
                    "weight": 1
                });
            }

            // instantiate force
            self.force = d3.layout.force()
                .nodes(self.label.nodes)
                .links(self.label.links)
                .size([ self.width(), self.height() ])
                .linkDistance(0)
                .linkStrength(8)
                .charge(-400)
                .start();

            // render nodes, links
            self.forces = {};

            self.forces.links = self.dataGrp.selectAll("line.link")
                .data(self.force.links())
                .enter()
                .append("svg:line")
                .attr("class", "link")
                .style("stroke", "#000000")
                .style("stroke-width", 0);

            self.forces.nodes = self.dataGrp.selectAll("g")
                .data(self.force.nodes())
                .enter()
                .append("svg:g")
                .attr("class", function (d, i) {
                    return i <= self.userData().length - 1 ? "node"
                        : "label";
                })
                // make labels disappear when datapt radius is zero
                .attr("visibility", function (d) {
                    return self.getRadius(d.Intensity) > 0 ? "visible"
                        : "hidden";
                });

            self.forces.nodes.append("svg:circle")
                .attr("r", function(d, i) {
                    return i < self.userData().length ?
                        self.getRadius(d.Intensity) : 0;
                })
                // only set class/id to valid circles (even)
                .attr("class", function(d, i) {
                    return i < self.userData().length ? "data" : "dummy";
                })
                .attr("id", function(d, i) {
                    return i < self.userData().length ? "pts" : "dummy";
                })
                .style("fill", function(d) {
                    return self.getColor(d.Intensity);
                })
                .style("fill-opacity", self.opac());

            self.forces.nodes.append("svg:text")
                .text(function(d, i) {
                    return i < self.userData().length ? "" : d.KinaseName;
                })
                // only set class/id to valid text labels (odd)
                .attr("class", function(d, i) {
                    return i < self.userData().length ? "dummy" : "data";
                }).attr("id", function(d, i) {
                    return i < self.userData().length ? "dummy" : "label";
                });

                // todo: fix this to work on groups only w/text
                d3.selectAll("g.label")
                .call(self.force.drag)
                .on("mousedown", function(d) {
                    d.fixed = true;
                });


            self.updateLink = function() {
                this.attr("x1", function(d) {
                    return d.source.x;
                }).attr("y1", function(d) {
                    return d.source.y;
                }).attr("x2", function(d) {
                    return d.target.x;
                }).attr("y2", function(d) {
                    return d.target.y;
                });
            };

            self.updateNode = function() {
                this.attr("transform", function(d) {
                    return "translate(" + d.x + ", " + d.y + ")";
                });
            };

            self.force.on("tick", function() {
                self.forces.links.call(self.updateLink);
                self.forces.nodes.call(self.updateNode);
            });

        };
    };

    KVM = new KinomeViewModel();

    ko.applyBindings(KVM);

}) (jQuery);
