// Crear un canal de comunicación
const channel = new BroadcastChannel("bibleVerseChannel");

// Event listener para cuando se reciba un versículo
channel.onmessage = function(event) {
    const verseData = event.data.split('"');
    const citation = `<div>${verseData[0]}</div>`;
    const text = `<div>${verseData[1]}</div>`;
    $("#verse-citation").html(citation);
    $("#verse-text").html(text);

    // Recuperar la fuente seleccionada del almacenamiento local
    const selectedFont = localStorage.getItem("selectedFont");
    if (selectedFont) {
        // Aplicar la fuente seleccionada al verso
        $("#verse-container").css("font-family", selectedFont);
    }
};
