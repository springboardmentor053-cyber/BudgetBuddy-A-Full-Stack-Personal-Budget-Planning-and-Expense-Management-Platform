import urllib.request
import urllib.error
import json

origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
]

endpoints = [
    'http://127.0.0.1:8000/api/register/',
    'http://127.0.0.1:8000/api/login/',
]

def test_cors():
    print("Testing CORS headers across origins...")
    for origin in origins:
        for url in endpoints:
            # 1. Test OPTIONS Preflight Request
            req_options = urllib.request.Request(url, method='OPTIONS')
            req_options.add_header('Origin', origin)
            req_options.add_header('Access-Control-Request-Method', 'POST')
            req_options.add_header('Access-Control-Request-Headers', 'content-type,authorization')
            
            try:
                with urllib.request.urlopen(req_options) as res:
                    headers = dict(res.info())
                    status = res.status
            except urllib.error.HTTPError as e:
                headers = dict(e.headers)
                status = e.code

            print(f"OPTIONS {url} from {origin} -> Status: {status}")
            allow_origin = headers.get('Access-Control-Allow-Origin') or headers.get('access-control-allow-origin')
            print(f"  Access-Control-Allow-Origin: {allow_origin}")
            assert allow_origin is not None, f"Missing Access-Control-Allow-Origin in OPTIONS preflight for {origin}"

            # 2. Test POST Request
            data = json.dumps({}).encode('utf-8')
            req_post = urllib.request.Request(url, data=data, method='POST')
            req_post.add_header('Origin', origin)
            req_post.add_header('Content-Type', 'application/json')
            
            try:
                with urllib.request.urlopen(req_post) as res:
                    headers = dict(res.info())
                    status = res.status
            except urllib.error.HTTPError as e:
                headers = dict(e.headers)
                status = e.code

            print(f"POST {url} from {origin} -> Status: {status}")
            allow_origin = headers.get('Access-Control-Allow-Origin') or headers.get('access-control-allow-origin')
            print(f"  Access-Control-Allow-Origin: {allow_origin}")
            assert allow_origin is not None, f"Missing Access-Control-Allow-Origin in POST response for {origin}"

    print("\n--- ALL CORS VERIFICATION TESTS PASSED SUCCESSFULLY ---")

if __name__ == '__main__':
    test_cors()
