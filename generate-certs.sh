#!/bin/sh

SERVER_IP=${1:-"129.168.50.6"}

echo "Génération des certificats pour IP: $SERVER_IP"
mkdir -p certs

# CA
openssl req -new -x509 -days 365 -extensions v3_ca \
  -keyout certs/ca.key -out certs/ca.crt \
  -subj "/CN=IoTQuiz-CA"

# Certificat serveur Mosquitto avec SAN (IP du serveur)
openssl genrsa -out certs/server.key 2048
openssl req -new -key certs/server.key -out certs/server.csr \
  -subj "/CN=mosquitto"
openssl x509 -req -days 365 -in certs/server.csr \
  -CA certs/ca.crt -CAkey certs/ca.key -CAcreateserial \
  -extfile <(printf "subjectAltName=IP:%s,DNS:mosquitto" "$SERVER_IP") \
  -out certs/server.crt

echo "Certificats générés dans ./certs/"
echo "Donner le fichier certs/ca.crt à l'équipe IoT"
