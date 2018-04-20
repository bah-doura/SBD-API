# SBD-API

#Installation

## prérequis

 - Node.js avec NPM
 - Une base de données PostgreSQL

#Usage

 - Téléchargez le projet et importez-le dans un IDE

 - Rendez-vous dans le fichier du projet à partir de votre terninale ensuite
  tapez la commande npm install pour installer les différentes bibliothèques.
  Vous pouvez aussi le faire facilement à partir du terminale de votre IDE de
   même avec la commande npm install.

## Configuration de postgresSql sur l'API

  - Rendez-vous dans le fichier de configuration  : server/datasources.json

  - Modifier les informations actuelles pour mettre  les inforations de votre base de données postgreSql :
     - host: 'localhost'
     - port: le numero de port de votre base de données qui est plus souvent  '5432'
     - url: l'url de votre base de données ( vous pouvez vous inspirer des informations sur l'url actuel pour construire le votre
     - database : le nom de votre base de donnes postgresSQL
     - password : le mot de passe de votre base de données
     - name: le nom de votre base de données
     - user : le nom d'utilisateur de votre base de données
     connector : vous mettez 'postgresql'

## Lancer le programme
 - Avant de lancer le projet assurez vous de bien avoir configurer et  lancé votre Base de  données postgreSQL
 - Exécutez 'node .'  pour lancer l'API. Accédez à http://localhost:3000/explorer/# sur votre navigateur
  pour accéder à une interface d'exploration de l'API.
