# THIS IS THE FILE THAT SHOULD RUN ON THE TMF SERVER

import subprocess

from flask import Flask, request
from flask_cors import CORS
from requests import request

app = Flask(__name__)
CORS(app)


@app.route('/tmfd', methods=["POST"])
def handle_command():
    cmd = request.values.get("cmd")

    try:
        if not cmd:
            return 'No command provided'

        if cmd in [
            "/etc/init.d/tmfd start",
            "/etc/init.d/tmfd stop",
            "/etc/init.d/tmfd restart",
            "/etc/init.d/tmfd status"
        ]:
            result = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if result.returncode != 0:
                return result.stderr.decode()
            else:
                return result.stdout.decode()
        else:
            return 'Error: Invalid command'

    except Exception as e:
        return str(e)


if __name__ == "__main__":
    app.run(host='0.0.0.0')
