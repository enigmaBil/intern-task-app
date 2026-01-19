import { config } from 'dotenv';
import { resolve } from 'path';

// Charger le fichier .env de la racine du projet
config({ path: resolve(__dirname, '../../.env') });
