$(async function () {
    // Crear un canal de comunicación
    const channel = new BroadcastChannel("bibleVerseChannel");
    // Variable global para almacenar el capítulo actual
    let currentChapter = 1;

    // Función para enviar el versículo seleccionado
    function sendVerse(verse) {
        // Enviar el versículo a través del canal
        channel.postMessage(verse || ' ');
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

    $('#searchBtn').on('click', function () {
        const version = $('#version').val();
        const reference = $('#reference').val().toLowerCase(); // Convertir la referencia a minúsculas para una comparación más fácil

        // Obtener los datos del libro seleccionado
        const bookData = getVersionData(version);

        // Extraer el nombre del libro, el número del capítulo y el rango de versículos de la referencia
        const parts = reference.split(' '); // Separar la referencia en partes
        const bookName = parts.slice(0, -1).join(' '); // Unir las partes del nombre del libro
        const chapterVerse = parts.slice(-1)[0].split(':'); // Separar el capítulo y el rango de versículos

        console.log('bookName:', bookName);
        console.log('chapterVerse:', chapterVerse);

        // Buscar el libro en los datos
        const selectedBook = bookData.find(book => book.name.toLowerCase() === bookName);

        // Verificar si se encontró el libro y si se especificó un capítulo
        if (selectedBook) {
            const chapter = parseInt(chapterVerse[0]);

            if (chapter > 0 && chapter <= selectedBook.chapters.length) {
                const chapterData = selectedBook.chapters[chapter - 1];

                if (chapterVerse[1]) {
                    // Si se especifica un rango de versículos
                    const verseRange = chapterVerse[1].split('-'); // Separar el rango en inicio y fin
                    const startVerse = parseInt(verseRange[0]);
                    const endVerse = parseInt(verseRange[1]);

                    if (startVerse > 0 && endVerse > 0 && startVerse <= endVerse && endVerse <= chapterData.verses.length) {
                        // Mostrar el rango de versículos especificado
                        let resultText = '';
                        for (let i = startVerse; i <= endVerse; i++) {
                            resultText += formatVerse(selectedBook, chapter, i, version);
                        }
                        $('#result').html(resultText);
                        return; // Salir de la función después de mostrar los versículos
                    }
                } else {
                    // Si no se especifica un rango de versículos, mostrar todo el capítulo
                    let resultText = '';
                    chapterData.verses.forEach(verse => {
                        resultText += formatVerse(selectedBook, chapter, verse.number, version);
                    });
                    $('#result').html(resultText);
                    return; // Salir de la función después de mostrar los versículos
                }
            }
        }

        // Si no se especificó un capítulo, buscar por versículo individual
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
            case 'TLA':
                return TLA;
            case 'DHH':
                return DHH;
            case 'NTV':
                return NTV;
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

    // Manejar el clic en el botón "Capítulo Anterior"
    $('#prevChapterBtn').on('click', function () {
        const version = $('#version').val();
        const reference = $('#reference').val().toLowerCase(); // Convertir la referencia a minúsculas para una comparación más fácil

        // Obtener los datos del libro seleccionado
        const bookData = getVersionData(version);

        // Extraer el nombre del libro y el número del capítulo de la referencia
        const parts = reference.split(' '); // Separar la referencia en partes
        const bookName = parts.slice(0, -1).join(' '); // Unir las partes del nombre del libro

        // Buscar el libro en los datos
        const selectedBook = bookData.find(book => book.name.toLowerCase() === bookName);

        // Verificar si se encontró el libro y si se especificó un capítulo
        if (selectedBook && currentChapter > 1) {
            currentChapter--; // Decrementar el número del capítulo actual
            const prevChapterData = selectedBook.chapters[currentChapter - 1]; // Obtener los datos del capítulo anterior

            let resultText = '';
            prevChapterData.verses.forEach(verse => {
                resultText += formatVerse(selectedBook, currentChapter, verse.number, version);
            });
            $('#result').html(resultText); // Mostrar el capítulo anterior

            // Actualizar el campo de referencia
            $('#reference').val(selectedBook.name + ' ' + currentChapter);
        } else {
            alert('Este es el primer capítulo del libro');
        }
    });

// Manejar el clic en el botón "Siguiente Capítulo"
    $('#nextChapterBtn').on('click', function () {
        const version = $('#version').val();
        const reference = $('#reference').val().toLowerCase(); // Convertir la referencia a minúsculas para una comparación más fácil

        // Obtener los datos del libro seleccionado
        const bookData = getVersionData(version);

        // Extraer el nombre del libro y el número del capítulo de la referencia
        const parts = reference.split(' '); // Separar la referencia en partes
        const bookName = parts.slice(0, -1).join(' '); // Unir las partes del nombre del libro

        // Buscar el libro en los datos
        const selectedBook = bookData.find(book => book.name.toLowerCase() === bookName);

        // Verificar si se encontró el libro y si se especificó un capítulo
        if (selectedBook && currentChapter < selectedBook.chapters.length) {
            currentChapter++; // Incrementar el número del capítulo actual
            const nextChapterData = selectedBook.chapters[currentChapter - 1]; // Obtener los datos del siguiente capítulo

            let resultText = '';
            nextChapterData.verses.forEach(verse => {
                resultText += formatVerse(selectedBook, currentChapter, verse.number, version);
            });
            $('#result').html(resultText); // Mostrar el siguiente capítulo

            // Actualizar el campo de referencia
            $('#reference').val(selectedBook.name + ' ' + currentChapter);
        } else {
            alert('No hay más capítulos disponibles');
        }
    });

    // Manejar el clic en un verso
    $(document).on('click', '.verse', function () {
        const verseText = $(this).text();
        const selectedVerse = $(this).hasClass('selected'); // Verificar si el verso ya ha sido seleccionado

        // Si el verso ya ha sido seleccionado, ocultarlo
        if (selectedVerse) {
            $(this).removeClass('selected'); // Quitar la clase "selected"
            $(this).css('background-color', ''); // Quitar el color de fondo amarillo

            sendVerse(''); // Enviamos un mensaje vacío

            // Ocultar el verso en verso.html
            $('#verse-citation').empty();
            $('#verse-text').empty();

            localStorage.setItem('selectedVerse', ' '); // Almacenar el verso en el almacenamiento local

        } else {
            // Limpiar la selección anterior
            $('.verse').removeClass('selected');
            $('.verse').css('background-color', '');

            $(this).addClass('selected'); // Agregar la clase "selected" al verso seleccionado
            $(this).css('background-color', 'yellow'); // Cambiar el color de fondo a amarillo
            // Mostrar el verso en verso.html
            $('#verse-citation').html($(this).find('.verse-citation').html());
            $('#verse-text').html($(this).find('.verse-text').html());

            // Enviar el versículo seleccionado a través del canal
            sendVerse(verseText);
            localStorage.setItem('selectedVerse', verseText); // Almacenar el verso en el almacenamiento local

        }
    });

});

