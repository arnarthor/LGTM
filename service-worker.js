const CACHE_NAME = 'LGTM';

var isImageRequest = function(request) {
  return (request.method === 'GET' &&
          request.headers.get('accept').indexOf('image') !== -1);
};

self.addEventListener('fetch', function(event) {
  if (!isImageRequest(event.request)) {
    event.respondWith(fetch(event.request));
  } else {
    event.respondWith(
      caches.match(event.request)
      .then(function(response) {
        if (response) {
          console.log('Cache hit!');
          return response;
        }

        console.log('Cache miss!');
        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(function(response) {
          // IMPORTANT: Clone the response. A response is a stream
          // and because we want the browser to consume the response
          // as well as the cache consuming the response, we need
          // to clone it so we have 2 stream.
          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
    );
  }
});
