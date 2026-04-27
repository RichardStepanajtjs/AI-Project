@echo off
echo Applicatie stack afsluiten...
docker compose down

echo Traefik afsluiten...
docker compose -f Traefik\traefik.yml down

echo Alles is netjes afgesloten.
pause