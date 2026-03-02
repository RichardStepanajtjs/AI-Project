FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    python3.12 \
    python3-pip \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g @angular/cli

COPY requirements.txt .

# Dit geeft root access om toch de packages te installeren "--break-system-packages".
RUN pip install --break-system-packages -r requirements.txt