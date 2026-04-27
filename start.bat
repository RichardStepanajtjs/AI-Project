@echo off
echo Traefik opstarten...
docker compose -f Traefik\traefik.yml up -d

echo Applicatie stack opstarten...
docker compose up -d

echo Alles staat online!
pause