#!/usr/bin/env python
# Copyright 2012 (c) Joseph Lee
# This may be distrituted under the MIT Licence
# Convert basic CSV to JSON

from sys import argv

csv_fname = ''
json_fname = ''
tab = '    '    # tab = 4spaces

if len(argv) == 2:
    if argv[1] == '-h' or argv[1] == '--help':
        # Print help
        print '''
csv2json [src.csv [dst.json]]
'''
    else:
        # Convert src_name.csv to src_name.json
        print 'no output name, using csv name'
        csv_fname = argv[1]
        json_fname = csv_fname.split('.')
        if json_fname[-1] == 'csv':
            json_fname[-1] = 'json'
        elif json_fname[-1] != 'json':
            json_fname.append('json')
        json_fname = '.'.join(json_fname)
elif len(argv) == 3:
    # input CSV and output JSON filename specified
    csv_fname = argv[1]
    json_fname = argv[2]
elif len(argv) == 1:
    # Read from stdin
    print 'coming soon, stdin'

print 'csv_fname: ' + csv_fname + '\njson_fname: ' + json_fname
try:
    csv_f = open(csv_fname, 'r')
    json_f = open(json_fname, 'w')
except:
    print 'error reading file. terminating.'
    exit()
csv_f = csv_f.readlines()
header = csv_f.pop(0).split(',')    # set headers
json_f.write('[\n')       # write object name

for line in csv_f:
    # r/w
    c = 0   # counter index
    json_f.write(tab + '{ ')
    for i in line.split(','):
        json_f.write('"' + header[c].strip() + '": "' + i.strip() + '", ')
        c+=1
    json_f.write("},\n")
json_f.write('\n]')
