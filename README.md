# Juego de Cartas - Multijugador Online

Un juego de cartas multijugador en tiempo real que admite tanto baraja de Póker (francesa) como baraja Española. Incluye mecánicas de apuestas, rondas especiales de 1 carta y clasificación en vivo.

## 🎮 Características

- **Dos tipos de baraja**: Elige entre Póker (52 cartas, máximo 10 jugadores) o Española (40 cartas, máximo 8 jugadores)
- **Multijugador en tiempo real**: Juega con amigos usando códigos de sala
- **Juego estratégico**: Apuesta cuántas manos crees que vas a ganar, con restricciones para el repartidor
- **Ronda especial de 1 carta**: ¡No puedes ver tu propia carta! Engaña, farolea o ayuda a otros
- **Modo Duelo**: Cuando quedan 2 jugadores, solo se juegan rondas de 1 carta
- **Clasificación en vivo**: La barra lateral muestra el ranking según las vidas restantes
- **Resultados mano a mano**: El ganador recoge las cartas después de cada mano
- **Selección de repartidor**: El anfitrión puede elegir asignación aleatoria o manual del repartidor
- **Manipulacion de vidas**: El anfitrión puede reducir o aumentar el numero de vidas de los jugadores dentro de los límites
- **Ranking de victorias**: Cuenta con un ranking de las victorias obtenidas por los jugadores al estilo de los registros de las máquinas arcades

## 🚀 Tecnologías utilizadas

**Frontend:**
- React + Vite
- Tailwind CSS
- Socket.IO Client

**Backend:**
- Node.js
- Express
- Socket.IO

## 🎯 Cómo jugar

### Configuración de la partida

1. Introduce tu nombre en la sala de espera  
2. Elige el tipo de baraja (Póker o Española)  
3. Crea una nueva partida o únete con un código de sala  
4. El anfitrión puede configurar:
   - Tipo de baraja
   - Repartidor inicial (aleatorio o manual)
5. Espera a que se unan jugadores (mínimo 2)  
6. El anfitrión inicia la partida  

### Rondas normales (5-2 cartas)

**1️⃣ Fase de reparto**
- Se reparten cartas según la ronda actual (5→4→3→2)

**2️⃣ Fase de apuestas**
- Los jugadores apuestan cuántas manos creen que ganarán
- Restricción del repartidor: La suma total de apuestas no puede ser igual al número de cartas repartidas
- El orden de apuesta comienza después del repartidor

**3️⃣ Fase de juego**
- Cada jugador juega una carta por mano
- La carta más alta gana la mano
- El ganador de la mano recoge las cartas y empieza la siguiente
- Valores en Póker: A(1) < 2 < 3... < K(13)
- Valores en Española: 1 < 2... < 7 < Sota(10) < Caballo(11) < Rey(12)

**4️⃣ Fase de puntuación**
- Pérdida de vidas = |apuesta - manos ganadas|
- Se asigna el siguiente repartidor (o el anfitrión puede reasignarlo)

### Ronda especial de 1 carta

- **¡No puedes ver tu propia carta!**
- Puedes ver las cartas de los demás
- Apuesta "Gano" o "Pierdo"
- Pierdes 1 vida si fallas
- No hay restricciones de comunicación: ¡farolea libremente!

### Modo Duelo (2 jugadores)

Cuando solo quedan 2 jugadores, se juegan únicamente rondas de 1 carta hasta que haya un ganador.

### Condición de victoria

¡El último jugador con vidas restantes gana!

## 👥 Autores

Tu Nombre - [https://github.com/Unai2310]
