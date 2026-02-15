import requests
import os
from dotenv import load_dotenv

# Dit is om de environment variabelen in te laden.
load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
X_IBM_CLIENT_ID = os.getenv("X_IBM_CLIENT_ID")

# Dit is om te controleren
if not all([CLIENT_ID, CLIENT_SECRET, X_IBM_CLIENT_ID]):
    print("Error: Niet alle environment variables zijn aanwezig!")
    exit(1)

# Je moet eerst een post uitvoeren voor een bearer key.
token_url = "https://op-derden.vdab.be/isam/sps/oauth/oauth20/token"

token_response = requests.post(
    token_url,
    data={
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope": "openid"
    }
)
print(f"Token response: {token_response.text}")

# Dit zijn checks om sneller te kunnen debuggen.
if token_response.status_code != 200:
    print("Error: Token request failed!")
    exit(1)

token_data = token_response.json()
if "access_token" not in token_data:
    print(f"Error: No access token in response: {token_data}")
    exit(1)

access_token = token_data["access_token"]
print(f"Access token received: {access_token[:20]}...")

# Dit is de URL voor de api keys. Dit kan je nog aanpassen om specifieke resultaten te krijgen.
url = "https://api.vdab.be/services/openservices/vacatures/v4/vacatures/bulk?van=2026-02-13T12:00:00.000Z&tot=2026-02-14T12:00:00.000Z"

headers = {
    "Authorization": f"Bearer {access_token}",
    "X-IBM-Client-Id": X_IBM_CLIENT_ID,
    "accept": "application/json"
}

print(f"\nCalling API: {url}")
response = requests.get(url, headers=headers)