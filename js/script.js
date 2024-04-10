$(document).ready(function() {
    // Crear un canal de comunicación
    const channel = new BroadcastChannel("bibleVerseChannel");

    // Función para enviar el versículo seleccionado
    function sendVerse(verse) {
        // Enviar el versículo a través del canal
        channel.postMessage(verse);
    }

    /// Ocultar la lista de autocompletado al cargar la página
    $('#autocomplete-list').hide();

    // Autocompletado para el campo de entrada de referencia
    $('#reference').on('input', function() {
        const version = $('#version').val();
        const reference = $(this).val().toLowerCase(); // Convertir la entrada del usuario a minúsculas
        let suggestions = [];

        // Obtener los nombres de los libros de la versión seleccionada
        const books = getVersionData(version);

        // Filtrar sugerencias para encontrar coincidencias con la entrada del usuario
        suggestions = books.filter(book => {
            const bookName = book.name.toLowerCase();
            // Buscar coincidencias con el nombre completo del libro
            if (bookName === reference) {
                return true;
            }
            // Buscar coincidencias con el prefijo de la entrada del usuario
            return bookName.startsWith(reference);
        });

        showSuggestions(suggestions);
    });

    // Función para mostrar u ocultar la lista de autocompletado
    function showSuggestions(suggestions) {
        const autocompleteList = $('#autocomplete-list');
        if (suggestions.length > 0) {
            autocompleteList.show(); // Mostrar la lista si hay sugerencias
        } else {
            autocompleteList.hide(); // Ocultar la lista si no hay sugerencias
        }

        autocompleteList.empty(); // Limpiar lista de sugerencias
        suggestions.forEach(function(suggestion) {
            const listItem = $('<div class="list-item">').text(suggestion.name); // Acceder al nombre del libro
            listItem.on('click', function() {
                $('#reference').val(suggestion.name + ' '); // Usar el nombre del libro como sugerencia
                autocompleteList.hide(); // Ocultar la lista después de seleccionar una sugerencia
            });
            autocompleteList.append(listItem);
        });
    }

    // Realizar búsqueda del versículo seleccionado
    $('#searchBtn').on('click', function() {
        const version = $('#version').val();
        const reference = $('#reference').val();

        // Normalizar y dividir la referencia del usuario en nombre del libro, número del capítulo y números de versículos
        const parts = reference.split(' ');
        const bookName = parts[0].toLowerCase(); // Convertir el nombre del libro a minúsculas
        let chapterVerse = parts[1] ? parts[1].split(':') : [0, 0]; // Dividir capítulo y versículo si está presente
        let chapter = parseInt(chapterVerse[0]);
        let versesRange = chapterVerse[1] ? chapterVerse[1].split('-').map(v => parseInt(v)) : [0, 0]; // Dividir rango de versículos si está presente

        // Obtener los datos del libro seleccionado
        const bookData = getVersionData(version);
        const selectedBook = bookData.find(book => book.name.toLowerCase() === bookName);

        let resultText = '';

        if (selectedBook && chapter > 0 && chapter <= selectedBook.chapters.length) {
            if (versesRange[0] > 0 && versesRange[1] > 0) {
                // Si se especifica un rango de versículos, mostrar esos versículos
                for (let i = versesRange[0]; i <= versesRange[1]; i++) {
                    if (i <= selectedBook.chapters[chapter - 1].verses.length) {
                        resultText += formatVerse(selectedBook, chapter, i, version);
                    }
                }
            } else if (chapterVerse[1] && !isNaN(chapterVerse[1])) {
                // Si se especifica un versículo, mostrar solo ese versículo
                const verse = parseInt(chapterVerse[1]);
                if (verse <= selectedBook.chapters[chapter - 1].verses.length) {
                    resultText += formatVerse(selectedBook, chapter, verse, version);
                }
            } else {
                // Si no se especifica un rango de versículos ni un versículo, mostrar todo el capítulo
                selectedBook.chapters[chapter - 1].verses.forEach(verse => {
                    resultText += formatVerse(selectedBook, chapter, verse.number, version);
                });
            }
        } else {
            resultText = 'Versículo no encontrado';
        }

        $('#result').html(resultText);

        // Cambiar la URL sin recargar la página
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('version', version);
        urlParams.set('reference', reference);
        const newUrl = window.location.pathname + '?' + urlParams.toString();
        history.pushState(null, null, newUrl);
    });

    // Función para formatear el verso con la tipografía seleccionada
    function formatVerse(book, chapter, verse, version) {
        const verseText = book.chapters[chapter - 1].verses[verse - 1].text;
        const citation = '<strong>' + chapter + ':' + verse + ' ' + book.name + ' ' + version + '</strong>';
        const fullVerse = '<strong>' + chapter + ':' + verse + ' ' + book.name + ' ' + version + '</strong>' + ' - "' + verseText + '"';
        return '<div class="verse my-2">' + fullVerse + '</div>';
    }

    // Función para obtener los datos de la versión seleccionada
    function getVersionData(version) {
        switch (version) {
            case 'LBLA':
                return LBLA;
            case 'NVI':
                return NVI;
            case 'RV1960':
                return RV1960;
            default:
                return []; // Devolver un array vacío si la versión no es válida
        }
    }

    // Cambiar la tipografía del verso cuando se selecciona una nueva opción en el menú desplegable
    $('#fontSelect').change(function() {
        const selectedFont = $(this).val();
        $('.verse').css('font-family', selectedFont);

        // Guardar la fuente seleccionada en el almacenamiento local
        localStorage.setItem('selectedFont', selectedFont);
    });


    // Manejar el clic en un verso
    $(document).on('click', '.verse', function() {
        const verseText = $(this).text();
        localStorage.setItem('selectedVerse', verseText); // Almacenar el verso en el almacenamiento local

        // Enviar el versículo seleccionado a través del canal
        sendVerse(verseText);
    });
});
