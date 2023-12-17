from http.server import BaseHTTPRequestHandler, HTTPServer
from os import listdir

host_name = "localhost"
server_port = 8080

class Server(BaseHTTPRequestHandler):
    def do_GET(self):
        file_path = self.path.split('?')[0]
        if file_path.replace('.', '').replace('/', '') == '':
            file_path = 'index.html'
            mime = 'html'
        else: mime = file_path.split('.')[-1]
        self.send_response(200)
        self.send_header("Content-type", f"text/{mime}")
        self.end_headers()
        with open(f"./{file_path}", 'r') as requested_file:
            self.wfile.write(bytes(requested_file.read(), "utf-8"))

    def do_PUT(self):
        length = int(self.headers['Content-Length'])
        with open(f"./{self.path}", 'wb') as f:
            f.write(self.rfile.read(length))
        self.send_response(201, "Created")
        self.end_headers()

if __name__ == "__main__":

    web_server = HTTPServer((host_name, server_port), Server)
    print("Server started.")
    print(f"Create/Edit notebooks on: http://{host_name}:{server_port}/?<notebook>")

    print("Notebooks available:")
    for notebook in listdir("./documents"):
        print(f"http://{host_name}:{server_port}/?{notebook.replace('.tex', '')}")

    try: web_server.serve_forever()
    except KeyboardInterrupt: pass

    web_server.server_close()
    print("Server stopped.")
