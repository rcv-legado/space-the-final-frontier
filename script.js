if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { scope: './' })
        .then(function (reg) {
            console.log("Delicious ◕‿◕", reg);
        })
        .catch(function (err) {
            log('ServiceWorker failed to register. Are you visiting the HTTPS site?');
            log(err.message);
        });

    navigator.serviceWorker.addEventListener('message', function (event) {
        
        new Notification("Syncronized!");
        showImages(event.data);
    });
}

function showImages(data){
    let html = '';
    
    data.forEach(value=>{
        html += `<img src='${value.imgUrl}'><br>`;
    });
    
    document.getElementById('images').innerHTML = html;
}

function updateOnlineStatus(event) {
    var online = navigator.onLine;
    document.getElementById("network").innerHTML = online ? "You're Online" : "You're Offline";
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

updateOnlineStatus();

function sync() {

document.getElementById('images').innerHTML = 'Carregando...';

    new Promise(function (resolve, reject) {
        Notification.requestPermission(function (result) {
            if (result !== 'granted') return reject(Error("Denied notification permission"));
            resolve();
        })
    }).then(function () {

        navigator.serviceWorker.ready.then(function (reg) {
            if (reg.sync) {
                reg.sync.register({
                    tag: 'oneTimeSync'
                }).then(function (event) {
                    console.log('Sync registration successful', event);
                }).catch(function (error) {
                    new Notification("Sync registration failed!");
                });
            } else {
                new Notification("Onw time Sync not supported");
            }
        });

    }).catch(function (err) {
        console.log('It broke');
        console.log(err.message);
    });
}