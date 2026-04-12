import requests

class VDAB_api:
    TOKEN_URL = "https://op-derden.vdab.be/isam/sps/oauth/oauth20/token"
    VACATURES_URL = "https://api.vdab.be/services/openservices/vacatures/v4/vacatures?"

    def __init__(self, client_id, client_secret, x_ibm_client_id):
        self.client_id = client_id
        self.client_secret = client_secret
        self.x_ibm_client_id = x_ibm_client_id

    def get_token(self):
        response = requests.post(
            self.TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "scope": "openid",
            },
        )
        response.raise_for_status()
        return response.json()["access_token"]

    def get_recent_vacatures(self, aantal = 200):
        token = self.get_token()
        response = requests.get(
            self.VACATURES_URL,
            headers={
                "X-IBM-Client-Id": self.x_ibm_client_id,
                "Authorization": f"Bearer {token}",
                "accept": "application/json",
            },
            params={
                "aantal": aantal,
                "sinds": 1,
                "sorteerveld": "PUBLICATIE_DATUM",
                "filterDubbels": "true",
                "velden": ["leverancier", "tewerkstellingsgemeente", "beroep", "competentie", "vdabreferentie"],
            },
        )
        response.raise_for_status()
        return response.json().get("resultaten", [])