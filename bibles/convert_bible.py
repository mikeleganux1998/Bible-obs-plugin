import xml.etree.ElementTree as ET
import json
import codecs

def xml_to_json(xml_file):
    # Lee el archivo XML con la codificación adecuada
    with codecs.open(xml_file, 'r', encoding='utf-8-sig') as file:
        xml_data = file.read()

    # Parsea el XML
    root = ET.fromstring(xml_data)

    # Lista para almacenar los datos de todos los libros
    all_books_data = []

    # Itera sobre todos los elementos <b> (libros) en el XML
    for book_element in root.findall('.//b'):
        # Diccionario para almacenar los datos del libro actual
        book_data = {'name': book_element.get('n'), 'chapters': []}

        # Itera sobre todos los elementos <c> (capítulos) dentro del libro
        for chapter_element in book_element.findall('.//c'):
            chapter_data = {'number': chapter_element.get('n'), 'verses': []}

            # Itera sobre todos los elementos <v> (versículos) dentro del capítulo
            for verse_element in chapter_element.findall('.//v'):
                verse_data = {'number': verse_element.get('n'), 'text': verse_element.text.strip()}
                chapter_data['verses'].append(verse_data)

            # Agrega los datos del capítulo al libro actual
            book_data['chapters'].append(chapter_data)

        # Agrega los datos del libro actual a la lista de todos los libros
        all_books_data.append(book_data)

    # Convierte los datos de todos los libros a JSON
    json_data = json.dumps(all_books_data, ensure_ascii=False, indent=4)

    # Guarda el JSON en un archivo
    json_file_name = xml_file.replace('.xml', '.json').replace('.xmm', '.json')
    with open(json_file_name, 'w', encoding='utf-8') as json_file:
        json_file.write(json_data)

    print(f'Archivo {xml_file} convertido a JSON y guardado en {json_file_name}')

# Archivos XML que quieres convertir

archivos_xml = ['NTV.xmm']

# Convierte cada archivo XML a JSON
for xml_file in archivos_xml:
    xml_to_json(xml_file)
