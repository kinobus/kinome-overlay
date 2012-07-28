/* KinomeOverlay.js
 * Copyright 2012 (c) Joseph Lee & Nick Robin
 * This software may be distributed under the MIT License
 * See file LICENSE for details
 *
 * http://code.google.com/p/kinome-overlay
 */

// jQuery UI Sliders

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
    $("#accordion").accordion({
        autoHeight: true,
        navigation: true
    });
    // Plot kinase anchors
});

//$("#yint").slider({ min: -100, max: 100, step: 1, value: 1 });
var KinomeViewModel = function() {
    var self = this;

    self.slope = ko.observable(1);
    self.yint = ko.observable(0);

    self.kinases = [];

    $.getJSON("kotable.json", function(data) {
        self.kinases = data;
        for(i = 0; i < data.length; i++) {
            var newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            newCircle.setAttribute("cx", pF(data[i].xcoord) / 4);
            newCircle.setAttribute("cy", pF(data[i].ycoord) / 4);
            newCircle.setAttribute("r", self.slope());
            newCircle.setAttribute("id", data[i].GeneID);
            newCircle.setAttribute("class", "kinase");
            newCircle.setAttribute("data-bind", "attr: { r: slope() }");
            document.getElementById("kinome").appendChild(newCircle);
        }
    });


    self.setRadius = ko.computed(function() {
        return self.slope();
    }, this);
    
};

KVM = new KinomeViewModel();

ko.applyBindings(KVM);
