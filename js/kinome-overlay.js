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
    $("#slope").slider({ min: 0, max: 10, step: 1, value: 5,
        slide: function(event, ui) {
            KVM.slope(ui.value);
        }
    });
    $("#yint").slider({ min: -100, max: 100, step: 1, value: 1,
        slide: function(event, ui) {
            KVM.yint(ui.value);
        }
    });
    $("#control").draggable({ handle: "p" });
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
    $(".inh#red").slider({
        orientation: "horizontal",
        range: "min",
        max: 255,
        value: 255,
        slide: function(event, ui) {
            KVM.inhR(ui.value);
        },
        change: function(event, ui) {
            KVM.inhR(ui.value);
        }
    });
    $(".inh#green").slider({
        orientation: "horizontal",
        range: "min",
        max: 255,
        value: 0,
        slide: function(event, ui) {
            KVM.inhG(ui.value);
        },
        change: function(event, ui) {
            KVM.inhG(ui.value);
        }
    });
    $(".inh#blue").slider({
        orientation: "horizontal",
        range: "min",
        max: 255,
        value: 0,
        slide: function(event, ui) {
            KVM.inhB(ui.value);
        },
        change: function(event, ui) {
            KVM.inhB(ui.value);
        }
    });
    $(".act#red").slider({
        orientation: "horizontal",
        range: "min",
        max: 255,
        value: 0,
        slide: function(event, ui) {
            KVM.actR(ui.value);
        },
        change: function(event, ui) {
            KVM.actR(ui.value);
        }
    });
    $(".act#green").slider({
        orientation: "horizontal",
        range: "min",
        max: 255,
        value: 255,
        slide: function(event, ui) {
            KVM.actG(ui.value);
        },
        change: function(event, ui) {
            KVM.actG(ui.value);
        }
    });
    $(".act#blue").slider({
        orientation: "horizontal",
        range: "min",
        max: 255,
        value: 0,
        slide: function(event, ui) {
            KVM.actB(ui.value);
        },
        change: function(event, ui) {
            KVM.actB(ui.value);
        }
    });

    // Demo button
    $("#demo").button();
    $("#demo").click(function() {
        KVM.userData.push({ GeneID: 157, Intensity: 20, x: 300, y: 400, getRadius: function(i) { return 15; }, getColor: function(i) { return "red"; } } );
        KVM.userData.push({ GeneID: 157, Intensity: 20, x: 350, y: 100, getRadius: function(i) { return 30; }, getColor: function(i) { return "green"; } } );
        KVM.userData.push({ GeneID: 157, Intensity: 20, x: 600, y: 600, getRadius: function(i) { return 20; }, getColor: function(i) { return "blue"; } } );
    });


var KinomeViewModel = function() {
    var self = this;

    // radius scaling values
    self.slope = ko.observable(5);
    self.yint = ko.observable(0);


    // Observable color values
    self.inhR = ko.observable(255);
    self.inhG = ko.observable(0);
    self.inhB = ko.observable(0);

    self.actR = ko.observable(0);
    self.actG = ko.observable(255);
    self.actB = ko.observable(0);


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
                                return self.actColor();
                            }
                            else {
                                return self.inhColor();
                            }
                        }
                    });
                }
            }
        }
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

});
