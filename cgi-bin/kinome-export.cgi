#!/usr/bin/env python
# Python CGI script
# Converts kinome SVG to PNG
# using Imagemagick tools

import cgi
import subprocess

def main():
    print 'Content-Type: text/plain\n'
    form = cgi.FieldStorage();

    session = form['session'].value

    # convert svg to png
    subprocess.call(['convert',
        '../kinome-overlay/img/kinome.svg',
        '/tmp/' + session  + '.png'])
    img = open('/tmp/' + session + '.png', 'rb').read().encode('base64').replace('\n', '')
    print img

if __name__ == '__main__':
    main()
