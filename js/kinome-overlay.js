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

    // Upload file handle
    self.reader = new FileReader();
    self.reader.onloadend = function(e) {
        var temp = self.reader.result.split("\n");
        var csv_data = [];
        while(temp.length > 0) {
            data.push(temp.pop().split(','));
        }
        console.log(csv_data);

    };
    self.onFileUpload = function() {
        var upload_file = document.getElementById("csv_file").files;
        self.reader.readAsText(upload_file[0]);
    };

    self.parseCSV = function(raw_text) {
        var data = raw_text.split("\n");
        while(data.length > 0) {
            var temp = data.pop();
            //csv_data.concat(
        }
    };

};

KVM = new KinomeViewModel();

ko.applyBindings(KVM);
