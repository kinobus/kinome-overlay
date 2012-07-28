/* KinomeOverlay.js
 * Copyright 2012 (c) Joseph Lee & Nick Robin
 * This software may be distributed under the MIT License
 * See file LICENSE for details
 *
 * http://code.google.com/p/kinome-overlay
 */

// jQuery UI Sliders
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
        autoHeight: false,
        navigation: true
    });
});

$("#yint").slider({ min: -100, max: 100, step: 1, value: 1 });
var KinomeViewModel = function() {
    var self = this;

    self.slope = ko.observable(1);
    self.yint = ko.observable(0);

};

KVM = new KinomeViewModel();


ko.applyBindings(KVM);
