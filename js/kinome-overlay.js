/* KinomeOverlay.js
 * Copyright 2012 (c) Joseph Lee & Nick Robin
 * This software may be distributed under the MIT License
 * See file LICENSE for details
 *
 * http://code.google.com/p/kinome-overlay
 */

// Heavily used shortcut
pF = parseFloat;

$(document).ready(function() {
    $("#slope").slider({ min: 0, max: 10, step: 1, value: 1,
        slide: function(event, ui) {
            KVM.slope(ui.value);
        }
    });
    $("#yint").slider({ min: -100, max: 100, step: 1, value: 1,
        slide: function(event, ui) {
            KVM.yint(ui.value);
        }
    });
    $("#accordion").accordion();
});

var KinomeViewModel = function() {
    var self = this;

    self.slope = ko.observable(1);
    self.yint = ko.observable(0);

    // Synchronously get kinase coordinates
    self.kinases = [];
    $.ajax({
        async: false,
        dataType: "json",
        url: "kotable.json",
        success: function(data) {
            self.kinases = data;
            for(i = 0; i < self.kinases.length; i++) {
                self.kinases[i].xcoord /= 4;
                self.kinases[i].ycoord /= 4;
            }
        }
    });

    /* Upload file handle */
    self.userData = ko.observableArray();
    self.reader = new FileReader();

    // Event triggered by finished file upload
    // called upon completion of reader.readAsText
    self.reader.onloadend = function(e) {
        var data = self.reader.result.split("\n");
        while(data.length > 0) {
            var temp = data.pop();
            if (temp.length > 0) {
                temp = temp.split(",");
                if (pF(temp[0]) && pF(temp[1])) {   // discard non-numbers
                    var coord = self.getCoord(temp[0]);
                    self.userData.push({
                        "GeneID": temp[0],
                        "Intensity": temp[1],
                        "x": coord.x,
                        "y": coord.y,
                        "getRadius": function(intensity) {
                            var radius = self.slope() * intensity * Math.pow(-1, (intensity < 0)) + self.yint();
                            if (radius < 0) {
                                return 0;
                            }
                            return radius;
                        },
                        // TODO: add color bindings
                        "getColor": function(intensity) {
                            if (intensity >= 0) {
                                return "green";
                            }
                            else {
                                return "red";
                            }
                        }
                    });
                }
            }
        }
        //console.log(self.userData());
    };

    // Event binding on View: input file-upload
    self.onFileUpload = function() {
        var upload_file = document.getElementById("csv_file").files;
        self.reader.readAsText(upload_file[0]);
    };

    self.getCoord = function(geneid) {
        for(i = 0; i < self.kinases.length; i++) {
            if (self.kinases[i].GeneID == geneid) {
                return { 
                    "x": self.kinases[i].xcoord,
                    "y": self.kinases[i].ycoord
                };
            }
        }
        return null;
    };


};

KVM = new KinomeViewModel();

ko.applyBindings(KVM);
