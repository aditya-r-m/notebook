from http.server import BaseHTTPRequestHandler, HTTPServer
from os import listdir

host_name = "localhost"
server_port = 8080

class Server(BaseHTTPRequestHandler):
    def do_GET(self):
        mime = self.path.split('.')[-1]
        self.send_response(200)
        self.send_header("Content-type", f"text/{mime}")
        self.end_headers()
        if mime == "html":
            self.wfile.write(bytes("<html>", "utf-8"))
            with open("./head.html", 'r') as requested_file:
                self.wfile.write(bytes(requested_file.read(), "utf-8"))
            self.wfile.write(bytes("<body>", "utf-8"))
            try:
                self.wfile.write(bytes("<pre>", "utf-8"))
                with open(f"./data/{self.path}", 'r') as requested_file:
                    self.wfile.write(bytes(requested_file.read(), "utf-8"))
                self.wfile.write(bytes("</pre>", "utf-8"))
            except: pass
            with open("./input.html", 'r') as requested_file:
                self.wfile.write(bytes(requested_file.read(), "utf-8"))
            self.wfile.write(bytes("</body>", "utf-8"))
            self.wfile.write(bytes("</html>", "utf-8"))
        else:
            with open(f"./{self.path}", 'r') as requested_file:
                self.wfile.write(bytes(requested_file.read(), "utf-8"))


    def do_PUT(self):
        length = int(self.headers['Content-Length'])
        with open(f"./data/{self.path}", 'wb') as f:
            f.write(self.rfile.read(length))
        self.send_response(201, "Created")
        self.end_headers()

if __name__ == "__main__":

    web_server = HTTPServer((host_name, server_port), Server)
    print("Server started.")
    print(f"Create/Edit notebooks on: http://{host_name}:{server_port}/<notebook>.html")

    for notebook in listdir("./data"):
        print(f"Notebook available http://{host_name}:{server_port}/{notebook}")

    try: web_server.serve_forever()
    except KeyboardInterrupt: pass

    web_server.server_close()
    print("Server stopped.")
