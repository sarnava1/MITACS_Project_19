var correo = {};
correo.onStart = function (message) {
    var date = new Date();
    var fecha = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    fecha = fecha.toString();
    cordova.plugins.email.open({
        to: 'konarsarnava@gmail.com',
        subject: 'sample date: ' + fecha,
        body: message,
    });

};
