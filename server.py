from http.server import BaseHTTPRequestHandler, HTTPServer
from os import listdir

hostName = "localhost"
serverPort = 8080

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/': self.path = '/index.html'
        self.send_response(200)
        self.send_header("Content-type", f"text/{self.path.split('.')[-1]}")
        self.end_headers()
        if self.path.endswith('list.html'):
            self.wfile.write(bytes("\n".join(listdir("./data")), "utf-8"))

        with open(f"./{self.path}", 'r') as requested_file:
            self.wfile.write(bytes(requested_file.read(), "utf-8"))

if __name__ == "__main__":
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
