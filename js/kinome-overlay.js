/* kinome-overlay.js
 * Copyright 2012 (c) Joseph Lee & Nick Robin
 * This software may be distributed under the MIT License
 * See file LICENSE for details
 *
 * http://code.google.com/p/kinome-overlay
 */

(function ($) {
    'use strict';

    /**
     * Kinome ViewModel
     */
    var KinomeViewModel = function() {
        var self = this;
        self.width = 825;
        self.height = 975;

        // radius scaling values
        self.slope = 5;

        // FoldChange threshold value
        self.threshInh = 0;
        self.threshAct = 0;

        // largest magnitudes (positive-max, negative-min)
        self.minFoldChange = 0;     // for inh
        self.maxFoldChange = 0;     // for act

        // determine if p-value is present in dataset
        self.pValExist = false;

        self.pValMax = 0;

        // set labels for scaling factors
        self.slopeLabel = $('label#slope').text(self.slope);
        self.threshInhLabel = $('label#threshInh').text(self.threshInh);
        self.threshActLabel = $('label#threshAct').text(self.threshAct);

        // opacity
        self.opac = 0.8;

        // set opacity label
        self.opacLabel = $('label#opac').text(self.opac);

        // label visibility toggle
        self.labelToggle = $('#labelToggle').hasClass('active');
        self.labelToggleButton = $('#labelToggle').click(function() {
            self.labelToggle = !($('#labelToggle').hasClass('active'));
            self.setRadii();
        });

        // svg elements
        self.svg = d3.select('#kinome');
        self.dataGrp = d3.select('.data#grp');

        // Colors
        self.inhColor = $('#inh').attr('value');
        self.actColor = $('#act').attr('value');

        // Synchronously get kinase coordinates
        self.kinases = [];
        $.ajax({
            async: false,
            dataType: 'json',
            url: 'kotable.json',
            success: function(data) {
                while(data.length > 0) {
                    var temp = data.pop();
                    // scaling factor
                    temp.x /= 4;
                    temp.y /= 4;
                    temp.FoldChange = 0;
                    temp.P_Value = 0;
                    temp.fixed = true;
                    self.kinases.push(temp);
                }
            }
        });

        // plot static kinases endpoints
        self.kinaseGrp = d3.select('#kinase_grp').selectAll('circle')
            .data(self.kinases)
            .enter()
            .append('svg:circle')
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; })
            .attr('r', function(d) { return 4; })
            .attr('class', 'kinase')
            //.attr('id', function(d) { return d.GeneID; })
            .style('stroke', 'black')
            .style('stroke-width', '0.4')
            .style('fill', 'white')
            .style('fill-opacity', '0.5');

        /* Upload file handle */
        self.userData = [];
        self.reader = new FileReader();

        // Event binding on View: input file-upload
        self.onFileUpload = $('#csv_file').change(function() {
            var upload_file = document.getElementById('csv_file').files;
            for (var i = 0; i < upload_file.length; i++) {
                self.reader.readAsText(upload_file[i]);
            }
        });

        // Event triggered by finished file upload
        // called upon completion of reader.readAsText
        self.reader.onloadend = function(e) {

            // parse input data
            var data = self.reader.result.split('\n');
            for (var i = 0; i < data.length; i++) {
                data[i] = data[i].split(',');
            }
            self.applyData(data);
        };

        // Return Kinase object by GeneID
        self.getKinaseById = function (geneid) {
            for (var i = 0; i < self.kinases.length; i++) {
                if (self.kinases[i].GeneID === geneid) {
                    return self.kinases[i];
                }
            }
            return undefined;
        };

        // Return radius based on pValue
        self.getRadius = function (pValue) {
            // var radius = self.slope * pValue * (Math.pow(-1, (pValue < 0)));
            // return radius >= 0 ? radius : 0;
            var coeff = (5 / self.pValMax) * self.slope;
            return Math.abs(pValue * coeff);
        };

        // obtain approriate color for foldChange
        self.getColor = function (foldChange) {
            if (self.pValExist == false) {
                if (foldChange >= 0) {
                    return self.actColor;
                }
                return self.inhColor;
            }
            else {      // p-value exists, fc is gradient
                var scale = 0;
                if (foldChange > 0) {
                    scale = Math.abs(255 * (foldChange / self.maxFoldChange));
                }
                else {
                    scale = Math.abs(255 * (foldChange / Math.abs(self.minFoldChange)));
                }
                scale = (scale - parseInt(scale)) < 0.5 ? parseInt(scale) : parseInt(scale) + 1;
                return  foldChange > 0 ? d3.rgb(255 - scale, 255, 0).toString()
                    : d3.rgb(255, 255 - scale, 0).toString();
            }
        };

        // change all radii accordingly
        // use radius scaling events for data points
        self.setRadii = function() {
            if (self.pValExist == false) {
                d3.selectAll('.data#pts')
                    .attr('r', function(d) {
                        return self.getRadius(d.FoldChange);
                    })
                    .attr('visibility', function(d) {
                        var fc = d.FoldChange;
                        var radius = self.getRadius(d.FoldChange);
                        if (fc <= 0) {  // inhibitors
                            return (radius > 0 && fc < self.threshInh) ? 'visible'
                                : 'hidden';
                        }
                        else {  // activator
                            return (radius > 0 && fc > self.threshAct) ? 'visible'
                                : 'hidden';
                        }
                    });
            }
            else {
                d3.selectAll('.data#pts')
                    .attr('r', function(d) {
                        return self.getRadius(d.P_Value);
                    })
                    .attr('visibility', function(d) {
                        var fc = d.FoldChange;
                        var radius = self.getRadius(d.P_Value);
                        if (fc <= 0) {  // inhibitors
                            return (radius > 0 && fc < self.threshInh) ? 'visible'
                                : 'hidden';
                        }
                        else {  // activator
                            return (radius > 0 && fc > self.threshAct) ? 'visible'
                                : 'hidden';
                        }
                    });
            }
            // make labels disappear when datapt radius is zero or less OR under threshold
            d3.selectAll('.data#label')
                .attr('visibility', function(d) {
                    if (self.labelToggle === false) {
                        return 'hidden';
                    }
                    var fc = d.FoldChange;
                    var radius = self.getRadius(d.FoldChange);
                    if (fc <= 0) {  // inhibitors
                        return (radius > 0 && fc < self.threshInh) ? 'visible'
                            : 'hidden';
                    }
                    else {  // activator
                        return (radius > 0 && fc > self.threshAct) ? 'visible'
                            : 'hidden';
                    }
                })
                .style('font-family', 'sans-serif');
        };

        // change all colors accordingly
        // use color changing events for data points
        self.setColors = function() {

            // set all data node colors
            d3.selectAll('.data#pts')
                .style('fill', function(d) {
                    return self.getColor(d.FoldChange);
                })
                .style('stroke', 'white')
                .style('stroke-width', '1')
                .style('stroke-opacity', '0.5');

            // set color samples
            $('#inh').css('background-color', self.inhColor);
            $('#act').css('background-color', self.actColor);

        };

        // purge all foldChange data from kinases
        self.clearData = function () {
            self.userData = [];
            for (var i = 0; i < self.kinases.length; i++) {
                self.kinases[i].FoldChange = 0;
            }
            self.userData = [];
        };

        // parse, plot user uploaded data
        // uses closure of self.userData
        // self.userData should be sufficiently parsed
        // to an array of 2-element arrays:
        // [ [ GeneID, foldChange-value ], ... ]
        self.applyData = function (inputData) {
 
            // find if p-value is present in uploaded data
            if (inputData[0].length <= 2) {
                self.pValExist = false;
                $('#colorPickerTable').css('display', 'inline');
            }
            else {
                self.pValExist = true;
            }

            // sort inputData so smaller radii are visible
            // sort by p-value if present
            // else sort by fold change
            inputData.sort(function(left, right) {
                var index = self.pValExist == true ? 2 : 1;
                var l = Math.abs(left[index]);
                var r = Math.abs(right[index]);
                return l === r ? 0 : (l < r ? -1 : 1);
            });

            // reset min/max of fold change values
            self.minFoldChange = 0;
            self.maxFoldChange = 0;

            while (inputData.length > 0) {
                var temp = inputData.pop();
                var kinase;
                for (var i = 0; i < self.kinases.length; i++) {
                    kinase = self.kinases[i];
                    if (kinase.GeneID == temp[0]) {
                        // if only one column (in addition to GeneID),
                        // interpret as Fold Change. if two columns,
                        // interpret as fold change and p-value,
                        // respectively
                        kinase.FoldChange = temp[1];
                        if (self.pValExist == true) {
                            kinase.P_Value = temp[2];
                            if (kinase.P_Value > self.pValMax) {
                                self.pValMax = kinase.P_Value;
                            }
                        }
                        // else {      // TESTING add artificial constant p-value to test foldchange interaction
                        //     kinase.P_Value = 5;
                        //     self.pValMax = 5;
                        // }

                        // add to user data
                        self.userData.push(kinase);

                        // check for min/max value
                        if (kinase.FoldChange > self.maxFoldChange) {
                            self.maxFoldChange = kinase.FoldChange;
                        }
                        else if (kinase.FoldChange < self.minFoldChange) {
                            self.minFoldChange = kinase.FoldChange;
                        }
                        break;  // assuming exclusive GeneID
                    }
                }
            }
            // change threshold max
            $('#threshAct').slider({ max: self.maxFoldChange });
            $('#threshInh').slider({ max: Math.abs(self.minFoldChange) });

            // set pValMax to largest magnitude foldChange if pValue isn't in dataset
            if (self.pValExist == false) {
                self.pValMax = Math.abs(self.maxFoldChange) > Math.abs(self.minFoldChange) ?
                    self.maxFoldChange : Math.abs(self.minFoldChange);
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
            for (var i = 0; i < self.userData.length; i++) {
                self.label.nodes.push(self.userData[i]);
            }
            // label info
            for (var i = 0; i < self.userData.length; i++) {
                var temp = self.userData[i];
                self.label.nodes.push({
                    'GeneID': temp.GeneID,
                    'KinaseName': temp.KinaseName,
                    'FoldChange': temp.FoldChange,
                    'P_Value': temp.P_Value,
                    'fixed': false,
                    'x': temp.x,
                    'y': temp.y
                });
            }
            for (var i = 0; i < self.userData.length; i++) {
                self.label.links.push({
                    'source': i,
                    'target': i + self.userData.length,
                    'weight': 1
                });
            }

            // instantiate force
            self.force = d3.layout.force()
                .nodes(self.label.nodes)
                .links(self.label.links)
                .size([ self.width, self.height ])
                .linkDistance(0)
                .linkStrength(8)
                .charge(-200)
                .start();

            // render nodes, links
            self.forces = {};

            self.forces.links = self.dataGrp.selectAll('line.link')
                .data(self.force.links())
                .enter()
                .append('svg:line')
                .attr('class', 'link')
                .style('stroke', '#000000')
                .style('stroke-width', 0);

            self.forces.nodes = self.dataGrp.selectAll('g')
                .data(self.force.nodes())
                .enter()
                .append('svg:g')
                .attr('class', function (d, i) {
                    return i <= self.userData.length - 1 ? 'node'
                        : 'label';
                })
                // make labels disappear when datapt radius is zero
                .attr('visibility', function (d) {
                    return self.getRadius(d.FoldChange) > 0 ? 'visible'
                        : 'hidden';
                });

            self.forces.nodes.append('svg:circle')
                .attr('r', function(d, i) {
                    return i < self.userData.length ?
                        self.pValExist ?
                            self.getRadius(d.P_Value) :
                            self.getRadius(d.FoldChange)
                        : 0;
                })
                // only set class/id to valid circles (even)
                .attr('class', function(d, i) {
                    return i < self.userData.length ? 'data' : 'dummy';
                })
                .attr('id', function(d, i) {
                    return i < self.userData.length ? 'pts' : 'dummy';
                })
                .style('fill', function(d) {
                    return self.getColor(d.FoldChange);
                })
                .style('fill-opacity', self.opac);

            self.forces.nodes.append('svg:text')
                .text(function(d, i) {
                    return i < self.userData.length ? '' : d.KinaseName;
                })
                // only set class/id to valid text labels (odd)
                .attr('class', function(d, i) {
                    return i < self.userData.length ? 'dummy' : 'data';
                }).attr('id', function(d, i) {
                    return i < self.userData.length ? 'dummy' : 'label';
                });

                // todo: fix this to work on groups only w/text
                d3.selectAll('g.label')
                .call(self.force.drag)
                .on('mousedown', function(d) {
                    d.fixed = true;
                });


            self.updateLink = function() {
                this.attr('x1', function(d) {
                    return d.source.x;
                }).attr('y1', function(d) {
                    return d.source.y;
                }).attr('x2', function(d) {
                    return d.target.x;
                }).attr('y2', function(d) {
                    return d.target.y;
                });
            };

            self.updateNode = function() {
                this.attr('transform', function(d) {
                    return 'translate(' + d.x + ', ' + d.y + ')';
                });
            };

            self.force.on('tick', function() {
                self.forces.links.call(self.updateLink);
                self.forces.nodes.call(self.updateNode);
            });

        };
    };

    var KVM = new KinomeViewModel();


    $('#slope').slider({ min: 0, max: 20, step: 1, value: 5,
        slide: function(event, ui) {
            KVM.slope = ui.value;
            KVM.slopeLabel.text(ui.value);
            KVM.setRadii();
        }
    });
    $('#threshInh').slider({ min: 0, max: 0, step: 0.01, value: 0,
        slide: function(event, ui) {
            KVM.threshInh = ui.value * -1;
            KVM.threshInhLabel.text(ui.value);
            KVM.setRadii();
        }
    });
    $('#threshAct').slider({ min: 0, max: 0, step: 0.01, value: 0,
        slide: function(event, ui) {
            KVM.threshAct = ui.value;
            KVM.threshActLabel.text(ui.value);
            KVM.setRadii();
        }
    });
    $('#opac').slider({ min: 0.1, max: 1, step: 0.1, value: 0.8,
        slide: function(event, ui) {
            KVM.opac = ui.value;
            KVM.opacLabel.text(ui.value);
            d3.selectAll('.data#pts')
                .style('fill-opacity', function(d) {
                    return ui.value;
                });
        }
    });

    // Color picker
    $('#inh').colorPicker().change(function() {
        KVM.inhColor = $(this).attr('value');
        KVM.setColors();
    });
    $('#act').colorPicker().change(function() {
        KVM.actColor = $(this).attr('value');
        KVM.setColors();
    });

    // Demo button
    // SigmaLBarMean Demo
    $('.demo').button();
    $('.demo#fc').click(function() {
        $.getJSON('data/SigmaLBarMean.json', function(demoData) {
            KVM.clearData();
            KVM.applyData(demoData);
        });
    });
    //$('.demo').button();
    $('.demo#fc_pVal').click(function() {
        $.getJSON('data/SigmaLBarMeanPval.json', function(demoData) {
            KVM.clearData();
            KVM.applyData(demoData);
        });
    });
    $('#export').button().click(function() {
        $.ajax({
            type: 'POST',
            url: 'cgi-bin/kinome-export.cgi',
            data: {
                'session': function() {
                    var session = Math.floor(Math.random() * 0x1000).toString(16);
                    return session;
                },
                'svgData': $('#kinomeDiv').html()
            },
            success: function(data) {
                $('.modal-body').html('<img src="data:image/png;base64,' + data + '" />');
                $('.modal').modal({
                    'show': true
                }).css({
                    'width': '360px',
                    'margin-left': '-180px'
                });
            }
        });
    });


}) (jQuery);
