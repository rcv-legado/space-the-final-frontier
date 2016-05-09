
var apiKey = '72304591bf01348a6a1ade0acb5e589a';
var apiUrl = 'https://api.flickr.com/services/rest/';

function search(text, opts) {
    var params = {
        method: 'flickr.photos.search',
        user_id: '142399131@N04',
        extras: 'description',
        format: 'json',
        api_key: apiKey,
        text: text,
        license: '4,5,6,7',
        content_type: 1,
        nojsoncallback: 1,
        per_page: 10
    };

    return fetch(apiUrl + '?' + toQuerystring(params), opts).then(function (response) {
        return response.json();
    }).then(function (response) {
        if (response.stat == 'fail') {
            throw Error(response.err.msg);
        }

        return response.photos.photo.sort(function (a, b) {
            return b.id - a.id;
        }).map(function (photo) {
            return {
                id: photo.id,
                title: photo.title,
                flickrUrl: 'https://www.flickr.com/photos/' + photo.owner + '/' + photo.id + '/',
                imgUrl: 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_c.jpg',
                description: photo.description._content.trim()
            };
        });
    });
}


function toQuerystring(obj) {
    var str = [];
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    }
    return str.join("&");
}

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('sync', function (event) {
    search().then(function (data) {
        sendAllMessagesToCliente(data);
    });
});

self.addEventListener('periodicsync', function (event) {
    console.dir(event);
    if (event.registration.tag == "periodicSync") {
        console.log("Periodic Sync fired");
    }
});

function sendMessagesToCliente(client, msg) {
    return new Promise(function (resolve, reject) {
        var msg_chan = new MessageChannel();

        msg_chan.port1.onmessage = function (event) {
            if (event.data.error) {
                reject(event.data.error);
            } else {
                resolve(event.data);
            }
        };

        client.postMessage(msg, [msg_chan.port2]);
    });
}

function sendAllMessagesToCliente(msg) {
    clients.matchAll().then(clients => {
        clients.forEach(client => {
            sendMessagesToCliente(client, msg).then(m => console.log("SW Received Message: " + m));
        })
    })
}