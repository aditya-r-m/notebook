from http.server import SimpleHTTPRequestHandler, HTTPServer

host_name = "localhost"
server_port = 8080

class Server(SimpleHTTPRequestHandler):
    def do_PUT(self):
        length = int(self.headers['Content-Length'])
        with open(f"./{self.path}", 'w+') as f:
            f.write(self.rfile.read(length).decode("utf-8"))
        self.send_response(201, "Created")
        self.end_headers()

if __name__ == "__main__":
    web_server = HTTPServer((host_name, server_port), Server)
    print("Server started")
    print(f"Create/Edit Notes on: http://{host_name}:{server_port}/?<page>")
    try: web_server.serve_forever()
    except KeyboardInterrupt: pass
    web_server.server_close()
    print("Server stopped")
