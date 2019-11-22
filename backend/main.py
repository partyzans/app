import hug
from falcon import HTTP_400, HTTP_200

from hug.middleware import CORSMiddleware
import io

api = hug.API(__name__)
api.http.add_middleware(CORSMiddleware(api))


@hug.startup()
def add_data(api):
    """Adds initial data to the api on startup"""
    print("It's working")


@hug.post('/upload')
def main(request, body, response, debug=True):
    print("Bwah", response)
    print(body)
    if not body:
        response.status = HTTP_400
    print(request)
    response.status = HTTP_200
