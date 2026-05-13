from machine import Pin, PWM, Timer
from utime import sleep, ticks_ms, ticks_diff
import network, ntptime, urequests
from umqtt.simple import MQTTClient
import json

global wlan
SSID = "BOB" #Linksys04779
PWD = "GOLDENGIRAF" #123456789
MQTT_SERVER = "10.101.61.242"
client_id = "pipico_w_1"
topic_pub = b"game/input"
topic_sub = b"game/feedback"

def connect():
    global wlan
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PWD)
    while not wlan.isconnected():
        print("En attente de connexion... ")
        sleep(1)
    print("connecté avec l'ip :", wlan.ifconfig()[0])


    
leds = [
    Pin(22, Pin.OUT), #vert1
    Pin(26, Pin.OUT), #rouge1
    Pin(27, Pin.OUT), #vert2
    Pin(28, Pin.OUT)  #rouge2
    ]
boutons = [
    Pin(16, Pin.IN, Pin.PULL_UP), # Bouton A
    Pin(17, Pin.IN, Pin.PULL_UP), # Bouton B
    Pin(18, Pin.IN, Pin.PULL_UP), # Bouton C
    Pin(19, Pin.IN, Pin.PULL_UP), # Bouton D
    Pin(20, Pin.IN, Pin.PULL_UP), # Joueur 1
    Pin(21, Pin.IN, Pin.PULL_UP)  # Joueur 2
]

buzzer = PWM(Pin(0))
etats_precedents = [False] * len(boutons)

joueur_actif = None
temps_buzz = None
joueur_en_faute = None
LIMITE_TEMPS = 5000

def bonne_reponse():
    buzzer.freq(2500)
    buzzer.duty_u16(32768)
    sleep(0.5)
    buzzer.duty_u16(0)

def mauvaise_reponse():
    buzzer.freq(2500)
    buzzer.duty_u16(32768)
    sleep(0.25)
    buzzer.duty_u16(0)
    sleep(0.1)
    buzzer.duty_u16(32768)
    sleep(0.25)
    buzzer.duty_u16(0)

connect()

def reception_msg(topic, msg):
    print("\n[MQTT] msg recu sur : ", topic.decode())
    print("[MQTT] contenu : ", msg.decode())
    data = json.loads(msg.decode())
    
    if data["event"] == "correct":
        print(f"Joueur {data['participant_id']} a bon !")
        bonne_reponse()

    elif data["event"] == "wrong":
        print(f"Joueur {data['participant_id']} a faux !")
        mauvaise_reponse()

def connect_mqtt():
    client = MQTTClient(client_id, MQTT_SERVER, port=1883)
    client.set_callback(reception_msg)
    client.connect()
    client.subscribe(topic_sub)
    print("connecté")
    return client

def envoie_reponse(data):
    dataJson = json.dumps(data)
    client.publish(topic_pub, dataJson.encode())
    print("msg envoyé")
    

    
btnJoueur1 = {"button_id":1}
btnJoueur2 = {"button_id":2}

try:
    client = connect_mqtt()
    sleep(1)
except Exception as e:
    print("Erreur 1", e)
    
while True:
    client.check_msg()
    #timer si un joueur a buzzé et pas de timer si un joueur a fait une faute
    if joueur_actif is not None and temps_buzz is not None:
        temps_ecoule = ticks_diff(ticks_ms(), temps_buzz)
        if temps_ecoule >= LIMITE_TEMPS:
            print(f"Joueur {joueur_actif} n'a pas répondu à temps !")
            joueur_en_faute = joueur_actif  # On mémorise qui a raté
            if joueur_en_faute == 1:
                leds[0].value(0)
                leds[1].value(1)
                leds[2].value(0)
                leds[3].value(0)
            if joueur_en_faute == 2:
                leds[0].value(0)
                leds[1].value(0)
                leds[2].value(0)
                leds[3].value(1)
            joueur_actif = None
            temps_buzz = None
            # l'autre joueur peut maintenant buzzer sans limite

    for i in range(len(boutons)):
        est_presse = (boutons[i].value() == 0)

        if est_presse and not etats_precedents[i]:
            etats_precedents[i] = True

            if i == 4:  # Joueur 1
                if joueur_actif is None and joueur_en_faute != 1:  # bloqué s'il a raté
                    joueur_actif = 1
                    envoie_reponse(btnJoueur1)
                    leds[0].value(1)
                    leds[1].value(0)
                    leds[2].value(0)
                    leds[3].value(1)
                    if joueur_en_faute == 2:
                        # l'autre a raté pas de timer
                        temps_buzz = None
                        print("Joueur 1 répond sans limite de temps.")
                    else:
                        temps_buzz = ticks_ms()
                        print("Joueur 1 a buzzé ! 5 secondes pour répondre.")

            elif i == 5:  # Joueur 2
                if joueur_actif is None and joueur_en_faute != 2:  # bloqué s'il a raté
                    joueur_actif = 2
                    envoie_reponse(btnJoueur2)
                    leds[0].value(0)
                    leds[1].value(1)
                    leds[2].value(1)
                    leds[3].value(0)
                    if joueur_en_faute == 1:
                        # l'autre a raté pas de timer
                        temps_buzz = None
                        print("Joueur 2 répond sans limite de temps.")
                    else:
                        temps_buzz = ticks_ms()
                        print("Joueur 2 a buzzé ! 5 secondes pour répondre.")

            elif i in [0, 1, 2, 3]:  # boutons A B C D
                if joueur_actif is not None:
                    reponse = [{"button_id":3}, {"button_id":4}, {"button_id":5}, {"button_id":6}][i]
                    envoie_reponse(reponse)
                    print(f"Joueur {joueur_actif} répond : {reponse}")
                    joueur_actif = None
                    temps_buzz = None
                    joueur_en_faute = None  # manche terminee on remet tout à zéro
                    for i in leds:
                        i.value(0)

        elif not est_presse and etats_precedents[i]:
            etats_precedents[i] = False

    sleep(0.01)
