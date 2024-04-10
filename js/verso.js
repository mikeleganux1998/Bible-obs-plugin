// Recuperar la fuente seleccionada del almacenamiento local
const selectedFont = localStorage.getItem('selectedFont');
if (selectedFont) {
    // Aplicar la fuente seleccionada al verso
    document.getElementById('selected-verse').style.fontFamily = selectedFont;
}

// Crear un canal de comunicación
const channel = new BroadcastChannel('bibleVerseChannel');

// Event listener para cuando se reciba un versículo
channel.onmessage = function(event) {
    const verseData = event.data.split('"'); // Dividir los datos del versículo en partes
    const citation = '<strong>' + verseData[0] + '</strong>'; // La primera parte es la cita en negrita
    const text = `"${verseData[1]}"`; // "Y dijo Dios: Sea la luz; y fue la luz."

    // Mostrar el versículo con la cita en negrita y el texto entre comillas en una fuente más clara
    document.getElementById('selected-verse').innerHTML = citation + '<span>'  + text + '</span>';
};