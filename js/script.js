$(document).ready(function () {
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
    $('#reference').on('input', function () {
        const version = $('#version').val();
        const reference = $(this).val().toLowerCase(); // Convertir la entrada del usuario a minúsculas
        let suggestions = [];

        // Obtener los nombres de los libros de la versión seleccionada
        const books = getVersionData(version);

        // Filtrar sugerencias para encontrar coincidencias con la entrada del usuario
        suggestions = books.filter(book => {
            const bookName = book.name.toLowerCase();
            // Buscar coincidencias con la entrada del usuario en el nombre del libro
            return bookName.includes(reference);
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
        suggestions.forEach(function (suggestion) {
            const listItem = $('<div class="list-item">').text(suggestion.name); // Acceder al nombre del libro
            listItem.on('click', function () {
                $('#reference').val(suggestion.name + ' '); // Usar el nombre del libro como sugerencia
                autocompleteList.hide(); // Ocultar la lista después de seleccionar una sugerencia
            });
            autocompleteList.append(listItem);
        });
    }

    // Realizar búsqueda del versículo seleccionado
    // Realizar búsqueda del versículo seleccionado
    $('#searchBtn').on('click', function () {
        const version = $('#version').val();
        const reference = $('#reference').val().toLowerCase(); // Convertir la referencia a minúsculas para una comparación más fácil

        // Obtener los datos del libro seleccionado
        const bookData = getVersionData(version);

        // Extraer el nombre del libro y el capítulo/verso de la referencia
        const parts = reference.split(' '); // Separar la referencia en partes
        const bookName = parts.slice(0, -1).join(' '); // Unir las partes del nombre del libro
        const chapterVerse = parts.slice(-1)[0].split(':'); // Separar el capítulo y el verso

        console.log('bookName:', bookName);
        console.log('chapterVerse:', chapterVerse);

        // Buscar el libro en los datos
        const selectedBook = bookData.find(book => book.name.toLowerCase() === bookName);

        // Verificar si se encontró el libro y si el capítulo/verso es válido
        if (selectedBook && chapterVerse.length === 2) {
            const chapter = parseInt(chapterVerse[0]);
            const verse = parseInt(chapterVerse[1]);

            if (chapter > 0 && chapter <= selectedBook.chapters.length && verse > 0) {
                // Encontrar el versículo dentro del capítulo
                const chapterData = selectedBook.chapters[chapter - 1];
                const selectedVerse = chapterData.verses.find(v => v.number == verse);

                if (selectedVerse) {
                    // Formatear el versículo y mostrarlo
                    const resultText = formatVerse(selectedBook, chapter, verse, version);
                    $('#result').html(resultText);
                    return; // Salir de la función después de mostrar el versículo
                }
            }
        }

        // Mostrar un mensaje si la referencia no es válida
        $('#result').html('Versículo no encontrado');
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
    $('#fontSelect').change(function () {
        const selectedFont = $(this).val();
        $('.verse').css('font-family', selectedFont);

        // Guardar la fuente seleccionada en el almacenamiento local
        localStorage.setItem('selectedFont', selectedFont);
    });


    // Manejar el clic en un verso
    $(document).on('click', '.verse', function () {
        const verseText = $(this).text();
        const selectedVerse = $(this).hasClass('selected'); // Verificar si el verso ya ha sido seleccionado

        // Si el verso ya ha sido seleccionado, ocultarlo
        if (selectedVerse) {
            $(this).removeClass('selected'); // Quitar la clase "selected"
            $(this).css('background-color', ''); // Quitar el color de fondo amarillo
            // Aquí puedes agregar la lógica para ocultar el verso de versos.html si es necesario
        } else {
            $(this).addClass('selected'); // Agregar la clase "selected" al verso seleccionado
            $(this).css('background-color', 'yellow'); // Cambiar el color de fondo a amarillo
            // Aquí puedes agregar la lógica para mostrar el verso en versos.html si es necesario
        }

        localStorage.setItem('selectedVerse', verseText); // Almacenar el verso en el almacenamiento local

        // Enviar el versículo seleccionado a través del canal
        sendVerse(verseText);
    });

});
