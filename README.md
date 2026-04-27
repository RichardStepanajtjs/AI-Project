<div align="center">

![GitHub All Releases](https://img.shields.io/github/downloads/RichardStepanajtjs/AI-Project/total)
[![Support](https://img.shields.io/badge/Support-Help%20Sokrates-orange?style=flat&logo=buy-me-a-coffee)](https://www.facebook.com/photo?fbid=147954622429123&set=a.107469846477601)
[![GitHub stars](https://img.shields.io/github/stars/RichardStepanajtjs/AI-Project.svg?style=social&label=Star)](https://github.com/RichardStepanajtjs/AI-Project)
![GitHub issues](https://img.shields.io/github/issues/RichardStepanajtjs/AI-Project)

# Sokrates AI Project

<img src="./Public/img/image_0.jpg" alt="Socrates Bust" width="300">

**Een full-stack AI-ecosysteem beveiligd door Traefik, ontworpen voor naadloze orchestratie tussen Frontend, NestJS Backend en PostgreSQL.**

</div>

## 📖 Project Beschrijving

Sokrates is een end-to-end applicatie die gebruikmaakt van een microservices architectuur. Het project is volledig gecontaineriseerd en maakt gebruik van **Traefik v3** als reverse proxy om verkeer veilig te routeren naar de juiste services via HTTPS en custom domeinnamen op de `traefik.me` DNS.

### 📄 `Env/api_keys.env`
```env
# Database Connectie (voor Backend)
DB_USER=data_user
DB_PASSWORD=data_pass
DB_HOST=database
DB_PORT=5432
DB_NAME=data_inventory

# Vul hier de API gegevens
CLIENT_ID=
CLIENT_SECRET=
X_IBM_CLIENT_ID=

# Gebruik een API key van https://www.voyageai.com/
VOYAGE_API_KEY=
```

### 📄 `Env/db.env`
```env
# PostgreSQL Configuratie
POSTGRES_DB=data_inventory
POSTGRES_USER=data_user
POSTGRES_PASSWORD=data_pass
POSTGRES_HOST=database
POSTGRES_PORT=5432
```

### 📄 `Env/pgadmin.env`
```env
# pgAdmin Inloggegevens
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin
```

### 🔐 `Env/testpassword.env`
```yaml
# Stel deze zelf in, voor wachtwoord moet je in ./Traefik/traefik.yml de hash vervangen met jou gekozen hash.
# traefik.http.middlewares.dashboard-auth.basicauth.users=admin:JOUW_HASH_HIER
USERNAME=
PASSWORD=
```

## 🚀 Quick Start (Windows)

Om het project als lector snel en foutloos op te starten, zijn er automatiseringsscripts toegevoegd die de juiste volgorde van netwerk- en containercreatie garanderen.

1. **Docker Desktop**: Zorg dat Docker actief is.
2. **Netwerk**: Maak eenmalig het gateway netwerk aan (indien dit nog niet bestaat):
   ```powershell
   docker network create gateway
   ```
3. **Launch**: Dubbelklik op het script in de root-map:
   ```text
   start.bat
   ```
   *Dit script start de Traefik gateway en de applicatie stack met automatische error-handling.*

## 🌐 Netwerk Architectuur & Toegang

Dankzij de Traefik configuratie zijn alle services bereikbaar via lokale DNS-records:

| Service | Endpoint | Beschrijving |
| :--- | :--- | :--- |
| **Frontend** | [sokrates.traefik.me](https://sokrates.traefik.me) | Gebruikersinterface (Angular/React) |
| **Backend API** | [nest.sokrates.traefik.me](https://nest.sokrates.traefik.me) | NestJS API gateway |
| **Dashboard** | [dashboard.sokrates.traefik.me](https://dashboard.sokrates.traefik.me) | Traefik monitoring (Beveiligd) |
| **Database** | [database.sokrates.traefik.me](https://database.sokrates.traefik.me) | pgAdmin interface voor PostgreSQL |

> 🔐 **Beveiliging**: Het dashboard en pgAdmin zijn beveiligd. De credentials zijn te vinden in de `traefik.yml` labels en de `.env` bestanden.

## 🏗 Tech Stack

* **Reverse Proxy:** Traefik v3.6 (met TLS & Dashboard)
* **Frontend:** Containerized UI op poort 4200
* **Backend:** NestJS Framework op poort 3000
* **Database:** PostgreSQL 16 (Alpine-based)
* **Management:** pgAdmin 8 & Docker Compose
* **Automatisering:** Batch scripts (`.bat`) met ErrorLevel validatie

## 🌊 Flows & Acties

Het systeem volgt een strikte flow om stabiliteit te garanderen:
* **Gateway Flow**: Inkomend verkeer op poort 80/443 wordt afgehandeld door Traefik en gerouteerd op basis van `Host` rules.
* **Startup Sequence**: De database wordt eerst gestart; de backend wacht via een `healthcheck` tot de DB klaar is voor connecties.
* **Security Flow**: Services in de `backend` network zijn afgeschermd van de buitenwereld, tenzij expliciet toegewezen aan de `gateway`.

## 🛑 Afsluiten

Om alle resources netjes vrij te geven en de database verbindingen te sluiten, gebruik:
```text
stop.bat
```

---
*Indien dit project nuttig is voor uw beoordeling, drop a star ⭐️ op GitHub.*
