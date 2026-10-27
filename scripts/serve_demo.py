#!/usr/bin/env python3
"""Serve only the compiled conceptual demonstration on this computer."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import argparse
import webbrowser
parser=argparse.ArgumentParser()
parser.add_argument('--port',type=int,default=8088)
parser.add_argument('--no-browser',action='store_true')
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]/'dist'
server=ThreadingHTTPServer(('127.0.0.1',args.port),partial(SimpleHTTPRequestHandler,directory=str(root)))
url=f'http://127.0.0.1:{args.port}/'
print(f'MITANG OFFICE: {url}',flush=True)
if not args.no_browser:webbrowser.open(url)
try:server.serve_forever()
except KeyboardInterrupt:server.server_close()
