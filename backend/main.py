import hug
import json
import base64
from random import random
from falcon import HTTP_400, HTTP_200

from hug.middleware import CORSMiddleware
import io

api = hug.API(__name__)
api.http.add_middleware(CORSMiddleware(api))


def writeFile(data):
    f = open('files/' + str(random()) + '.png', 'w+b')
    binary_format = bytearray(data)
    f.write(binary_format)
    f.close()

@hug.startup()
def add_data(api):
    """Adds initial data to the api on startup"""
    print("It's working")


@hug.post('/upload')
def main(request, body, response, debug=True):
    print("Bwah", response)
    print(type(body))
    print(len(body))

    decoded = base64.b64decode(body)
    writeFile(decoded)

    if not body:
        response.status = HTTP_400
    print(request)
    response.status = HTTP_200

@hug.get('/data')
def data(request, body, response, debug=True):
    response.status = HTTP_400

    fake_data = [
        {
            'id': 1,
            'certainty': 123,
            'img': 'img',
        },
        {
            'id': 2,
            'certainty': 13,
            'img': 'img',
        }
    ]
    return json.dumps(fake_data)
