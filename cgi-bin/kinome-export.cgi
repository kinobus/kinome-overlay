#!/usr/bin/env python
# Python CGI script
# Converts kinome SVG to PNG
# using Imagemagick tools

import cgi
import subprocess
import re

def main():
    print 'Content-Type: application/pdf'
    print 'Content-disposition: filename="kinome.pdf"\n'
    form = cgi.FieldStorage()

    session = form['session'].value
    svgData = form['svgData'].value
    kinome_svg = '../img/kinome.svg'    # path to bg kinome svg
    png = '/tmp/' + session + '.png'
    svg = '/tmp/' + session + '.svg'
    pdf = '/tmp/' + session + '.pdf'

    # modify SVG file
    # modify incoming svg data
    svgOpen = re.compile('\<svg[^>]*>').findall(svgData)[0]
    svgClose = re.compile('\<\/svg\>').findall(svgData)[0]
    imgOpen = re.compile('\<image[^>]*\>').findall(svgData)[0]
    imgClose = re.compile('\<\/image>').findall(svgData)[0]
    # svgData = svgData.replace(svgOpen, '').replace(svgClose, '').replace(imgOpen, '').replace(imgClose, '')
    # svgOpen = '<svg id="kinome">'
    # svgClose = '</svg>'
    # imgOpen = '<image xlink:href="img/kinome.svg" width="825px" height="975px">'
    # imgClose = '</image>'
    svgData = svgData.replace(svgOpen, '').replace(svgClose, '').replace(imgOpen, '').replace(imgClose, '')
    svgBg = open(kinome_svg, 'r').read()

    # insert into appropriate location
    svgFinal = svgBg[0:svgBg.find('</svg>') - 1] + svgData + svgBg[svgBg.find('</svg>'):]


    svgFile = open(svg, 'w')
    svgFile.write(svgFinal)
    svgFile.close()

    # convert svg to png
    # subprocess.call(['convert', svg, png])

    # convert svg to pdf
    subprocess.call(['rsvg-convert', '-f', 'pdf', '-o', pdf, svg])

    # send generated img string
    # img_str = open(png, 'rb').read().encode('base64').replace('\n', '')
    # print img_str

    pdf_str = open(pdf, 'rb').read().encode('base64')
    print pdf_str

    # clean up png
    subprocess.call(['rm', pdf])
    subprocess.call(['rm', svg])

if __name__ == '__main__':
    main()
