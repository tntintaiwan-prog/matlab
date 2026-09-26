"""Build and preview the public website; no account or database required."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from build_static import build, OUTPUT

if __name__ == '__main__':
    build()
    handler = partial(SimpleHTTPRequestHandler, directory=str(OUTPUT))
    print('Website: http://127.0.0.1:8000/ (Ctrl+C to stop)', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8000), handler).serve_forever()
