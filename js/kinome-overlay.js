/* KinomeOverlay.js
 * Copyright 2012 (c) Joseph Lee & Nick Robin
 * This software may be distributed under the MIT License
 * See file LICENSE for details
 *
 * http://code.google.com/p/kinome-overlay
 */

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

};

KVM = new KinomeViewModel();

ko.applyBindings(KVM);
