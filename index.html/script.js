// MQTT
const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');

const topics = [
    "silos/esp32/reading1",
    "silos/esp32/reading2",
    "silos/esp32/reading3",
    "silos/esp32/reading4"
];

// Sonido
const alarma = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");

// Crear gauges
function crearGauge(id){
    return new Chart(document.getElementById(id), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, 100],
                backgroundColor: ['lime', '#333'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '70%',
            plugins: { legend: { display: false } },
        }
    });
}

let g1 = crearGauge("g1");
let g2 = crearGauge("g2");
let g3 = crearGauge("g3");
let g4 = crearGauge("g4");

// Conexión
client.on('connect', () => {
    console.log("✅ MQTT conectado");
    topics.forEach(t => client.subscribe(t));
});

// Mensajes
client.on('message', (topic, message) => {

    let value = parseFloat(message.toString());

    if(isNaN(value)) return;

    value = Math.max(0, Math.min(100, value));

    if(topic.includes("reading1")) actualizar(g1, "t1", value);
    if(topic.includes("reading2")) actualizar(g2, "t2", value);
    if(topic.includes("reading3")) actualizar(g3, "t3", value);
    if(topic.includes("reading4")) actualizar(g4, "t4", value);
});

// Actualizar gauge
function actualizar(gauge, textId, value){

    let color = "lime";

    if(value < 30){
        color = "red";
        activarAlarma();
    }
    else if(value < 70){
        color = "orange";
    }

    gauge.data.datasets[0].data = [value, 100 - value];
    gauge.data.datasets[0].backgroundColor = [color, '#333'];
    gauge.update();

    document.getElementById(textId).innerText = value + "%";
}

// Alarma
function activarAlarma(){
    if(alarma.paused){
        alarma.play();
    }
}