import mqtt from 'mqtt';
import { env } from '../config/env';
import { handleInput } from './game.service';

const mqttUrl = env.MQTT_URL || 'mqtt://mosquitto:1883';
const mqttTopic     = env.MQTT_TOPIC          || 'game/input';
const mqttFeedback  = env.MQTT_FEEDBACK_TOPIC || 'game/feedback';

let mqttClient: mqtt.MqttClient | null = null;

export const mqttPublish = (payload: object) => {
  if (!mqttClient) return;
  mqttClient.publish(mqttFeedback, JSON.stringify(payload));
};

export const initMqtt = () => {
  const client = mqtt.connect(mqttUrl);
  mqttClient = client;

  client.on('connect', () => {
    client.subscribe(mqttTopic, (err) => {
      if (err) {
        console.error('MQTT subscribe error:', err);
      } else {
        console.log(`MQTT subscribed to ${mqttTopic}`);
      }
    });
  });

  client.on('message', async (_topic, message) => {
    try {
      const raw = message.toString().trim();
      let buttonId: number = NaN;

      if (raw.startsWith('{')) {
        try {
          // {"button_id": 1}
          const parsed = JSON.parse(raw);
          buttonId = Number(parsed.button_id ?? parsed.btn ?? parsed.id);
        } catch {
          // {1}
          const match = raw.match(/\{(\d+)\}/);
          if (match) buttonId = Number(match[1]);
        }
      } else if (raw.includes('=')) {
        // button_id=1
        const val = raw.split('=')[1];
        buttonId = Number(val);
      } else {
        // plain number: "1"
        buttonId = Number(raw);
      }

      if (!buttonId || isNaN(buttonId)) return;

      const result = await handleInput(buttonId);
      console.log(`[MQTT] button_id=${buttonId}`, result);
    } catch {
      console.warn('MQTT message ignored (unrecognized format):', message.toString());
    }
  });

  client.on('error', (error) => {
    console.error('MQTT error:', error);
  });
};
