Kinome Overlay is an open source, client-side web application that allows a bench scientist to upload siRNA screen results, MS based quantitative phosphoproteomics runs, or other kinomic datasets. Kinome Overlay generates a scatterplot that is overlaid on the Human Kinome dendrogram published in The Protein Kinase Complement of the Human Genome
G Manning, DB Whyte, R Martinez, T Hunter, S Sudarsanam (2002). The resulting image generated is an SVG graphic that may be exported and used freely.

Intensity values are uploaded as a CSV file (newline delimited rows, comma-separated columns with double-quotes demarcating strings) of key-value pairs of Gene IDs coinciding with the log-2 transform of the intensity value from experimental data.

Kinome Overlay is developed by Nick Robin of the University of Washington and Joseph Lee of Portland State University and may be distributed under the MIT License.


Instructions

Clone Kinome Overlay into an Apache HTTP Server locatable path.

  $ git clone https://code.google.com/p/kinome-overlay/

Navigate to PATH-TO/kinome-overlay/index.html in your web browser and begin using Kinome Overlay.
