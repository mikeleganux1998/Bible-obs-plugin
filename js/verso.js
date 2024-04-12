// Crear un canal de comunicación
const channel = new BroadcastChannel("bibleVerseChannel");

/// Event listener para cuando se reciba un versículo
channel.onmessage = function (event) {
    const verseData = event.data.split('"');

    console.log("verseData[0]", typeof verseData[0]);

    if (!verseData[0] || verseData[0].trim() === '') {
        // Si la primera parte del mensaje está vacía o es una cadena vacía
        $("#verse-citation").html('');
        $("#verse-text").html('');
    } else {
        // Si hay datos en la primera parte del mensaje
        const citation = `<div>${verseData[0]}</div>`;
        const text = `<div>${verseData[1]}</div>`;
        $("#verse-citation").html(citation || '');
        $("#verse-text").html(text || '');

        // Recuperar la fuente seleccionada del almacenamiento local
        const selectedFont = localStorage.getItem("selectedFont");
        if (selectedFont) {
            // Aplicar la fuente seleccionada al verso
            $("#verse-container").css("font-family", selectedFont);
        }
    }
};
