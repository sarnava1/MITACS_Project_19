var exporting = {};

exporting.sendMessage = function () {
    if (csvText == '') {
        alert('First start scan and get some samples to send')
        return;
    }

    var message = exporting.createcsv(csvText);

    correo.onStart(message);
    message = '';
};

exporting.createcsv = function (tablehtml) {
    var datos = tablehtml.replace(/<tr>/g, '')
        .replace(/<\/tr>/g, '<br/>')
        .replace(/<th>/g, '')
        .replace(/<\/th>/g, ',')
        .replace(/<td>/g, '')
        .replace(/<\/td>/g, ',')
        .replace(/<\t>/g, '')
        .replace(/<\n>/g, '')
        .replace(/<strong>/g, '')
        .replace(/<\/strong>/g, '');
    return datos;
};
