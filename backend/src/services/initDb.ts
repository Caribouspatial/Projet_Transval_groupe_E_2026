import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import { adminPassword, adminUsername } from '../config/auth';
import Question from '../models/Question';
import Quiz from '../models/Quiz';
import Session from '../models/Session';
import User from '../models/User';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const initDb = async () => {
  let connected = false;

  while (!connected) {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });
      console.log('MySQL tables synchronized');
      connected = true;

      await Session.update(
        { status: 'WAITING', current_question_id: null, question_index: 0 },
        { where: { status: 'ACTIVE' } }
      );

      const userCount = await User.count();
      if (userCount === 0) {
        const password_hash = await bcrypt.hash(adminPassword, 10);
        await User.create({
          username: adminUsername,
          password_hash,
          role: 'admin',
        });
        console.log('Admin user created');
      }

      const quizCount = await Quiz.count();
      if (quizCount === 0) {
        await Question.destroy({ where: {} });

        const [iot, culture, info, sciences] = await Quiz.bulkCreate([
          { title: 'IoT Quiz',          description: 'IoT, réseaux, informatique et culture générale.', icon: 'Zap',          is_active: true },
          { title: 'Culture Générale',  description: 'Géographie, histoire, sciences et actualité.',   icon: 'Globe',        is_active: true },
          { title: 'Informatique',      description: 'Algorithmes, systèmes, réseaux et sécurité.',    icon: 'Cpu',          is_active: true },
          { title: 'Sciences',          description: 'Physique, chimie, biologie et mathématiques.',   icon: 'FlaskConical', is_active: true },
        ]);

        await Question.bulkCreate([
          // IoT Quiz
          { quiz_id: iot.get('id'), text: 'Quel protocole est utilisé pour l\'IoT léger ?',        option_a: 'HTTP',        option_b: 'MQTT',           option_c: 'FTP',                        option_d: 'SMTP',               correct_answer: 'B', points: 20 },
          { quiz_id: iot.get('id'), text: 'Combien de bits dans un octet ?',                       option_a: '4',           option_b: '16',             option_c: '32',                         option_d: '8',                  correct_answer: 'D', points: 10 },
          { quiz_id: iot.get('id'), text: 'Quelle fréquence utilise le Wi-Fi 802.11n ?',           option_a: '900 MHz',     option_b: '2.4 / 5 GHz',   option_c: '60 GHz',                    option_d: '433 MHz',            correct_answer: 'B', points: 20 },
          { quiz_id: iot.get('id'), text: 'Qu\'est-ce que GPIO sur un Raspberry Pi ?',             option_a: 'Un protocole réseau', option_b: 'Un type de stockage', option_c: 'Des broches d\'entrée/sortie', option_d: 'Un système de fichiers', correct_answer: 'C', points: 20 },
          { quiz_id: iot.get('id'), text: 'Quelle couche OSI gère le routage IP ?',                option_a: 'Liaison',     option_b: 'Transport',      option_c: 'Réseau',                    option_d: 'Application',        correct_answer: 'C', points: 20 },
          { quiz_id: iot.get('id'), text: 'Quel composant stocke les données de façon volatile ?', option_a: 'SSD',         option_b: 'RAM',            option_c: 'ROM',                       option_d: 'HDD',                correct_answer: 'B', points: 10 },
          { quiz_id: iot.get('id'), text: 'Quel langage tourne nativement dans le navigateur ?',   option_a: 'Python',      option_b: 'Java',           option_c: 'JavaScript',                option_d: 'C++',                correct_answer: 'C', points: 10 },
          { quiz_id: iot.get('id'), text: 'Qu\'est-ce que le protocole Zigbee ?',                  option_a: 'Un réseau 5G', option_b: 'Un standard IoT sans fil basse consommation', option_c: 'Un langage embarqué', option_d: 'Un type de capteur', correct_answer: 'B', points: 20 },
          { quiz_id: iot.get('id'), text: 'Quelle est la vitesse de la lumière (km/s) ?',          option_a: '150 000',     option_b: '300 000',        option_c: '450 000',                   option_d: '600 000',            correct_answer: 'B', points: 20 },
          { quiz_id: iot.get('id'), text: 'Quel microcontrôleur est utilisé dans le Pico W ?',     option_a: 'ESP32',       option_b: 'ATmega328',      option_c: 'RP2040',                    option_d: 'STM32',              correct_answer: 'C', points: 20 },

          // Culture Générale
          { quiz_id: culture.get('id'), text: 'Quelle est la capitale de la France ?',             option_a: 'Lyon',        option_b: 'Marseille',      option_c: 'Paris',                     option_d: 'Bordeaux',           correct_answer: 'C', points: 10 },
          { quiz_id: culture.get('id'), text: 'Qui a peint la Joconde ?',                          option_a: 'Raphaël',     option_b: 'Michel-Ange',    option_c: 'Léonard de Vinci',          option_d: 'Botticelli',         correct_answer: 'C', points: 10 },
          { quiz_id: culture.get('id'), text: 'En quelle année a eu lieu la Révolution Française ?', option_a: '1789',     option_b: '1804',           option_c: '1776',                      option_d: '1815',               correct_answer: 'A', points: 10 },
          { quiz_id: culture.get('id'), text: 'Quel est le plus grand océan du monde ?',           option_a: 'Atlantique',  option_b: 'Indien',         option_c: 'Arctique',                  option_d: 'Pacifique',          correct_answer: 'D', points: 10 },
          { quiz_id: culture.get('id'), text: 'Combien de pays composent l\'Union Européenne ?',   option_a: '25',          option_b: '27',             option_c: '30',                        option_d: '32',                 correct_answer: 'B', points: 10 },

          // Informatique
          { quiz_id: info.get('id'), text: 'Qui a fondé Microsoft ?',                              option_a: 'Steve Jobs',  option_b: 'Elon Musk',      option_c: 'Bill Gates',                option_d: 'Mark Zuckerberg',    correct_answer: 'C', points: 10 },
          { quiz_id: info.get('id'), text: 'Que signifie CPU ?',                                   option_a: 'Central Processing Unit', option_b: 'Computer Power Unit', option_c: 'Core Processor Utility', option_d: 'Central Program Unit', correct_answer: 'A', points: 10 },
          { quiz_id: info.get('id'), text: 'Quel est le système de fichiers par défaut de Linux ?', option_a: 'NTFS',       option_b: 'FAT32',          option_c: 'ext4',                      option_d: 'exFAT',              correct_answer: 'C', points: 20 },
          { quiz_id: info.get('id'), text: 'Quelle structure de données fonctionne en LIFO ?',     option_a: 'File',        option_b: 'Pile',           option_c: 'Arbre',                     option_d: 'Graphe',             correct_answer: 'B', points: 20 },
          { quiz_id: info.get('id'), text: 'Quel port utilise HTTPS par défaut ?',                 option_a: '80',          option_b: '21',             option_c: '443',                       option_d: '8080',               correct_answer: 'C', points: 10 },

          // Sciences
          { quiz_id: sciences.get('id'), text: 'Quelle est la formule de l\'eau ?',                option_a: 'CO2',         option_b: 'H2O',            option_c: 'O2',                        option_d: 'NaCl',               correct_answer: 'B', points: 10 },
          { quiz_id: sciences.get('id'), text: 'Combien de chromosomes a un être humain ?',        option_a: '23',          option_b: '44',             option_c: '46',                        option_d: '48',                 correct_answer: 'C', points: 10 },
          { quiz_id: sciences.get('id'), text: 'Quelle est l\'unité de mesure de la force ?',      option_a: 'Joule',       option_b: 'Watt',           option_c: 'Pascal',                    option_d: 'Newton',             correct_answer: 'D', points: 10 },
          { quiz_id: sciences.get('id'), text: 'Quel est le symbole chimique de l\'or ?',          option_a: 'Or',          option_b: 'Go',             option_c: 'Au',                        option_d: 'Ag',                 correct_answer: 'C', points: 10 },
          { quiz_id: sciences.get('id'), text: 'Quelle planète est la plus proche du Soleil ?',    option_a: 'Vénus',       option_b: 'Mars',           option_c: 'Mercure',                   option_d: 'Terre',              correct_answer: 'C', points: 10 },
        ]);

        console.log('Seed: 4 quizz et 30 questions insérés');
      }
    } catch (error) {
      console.log('MySQL not ready yet. Retrying in 5 seconds.');
      await sleep(5000);
    }
  }
};
