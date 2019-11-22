console.warn('hello!');
var ENDPOINT = 'http://localhost:8000/upload/';
var pattern = 'https://isletnet.com/api/*';

browser.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({ url: 'index.html' });
});

function logURL(requestDetails) {
  console.log('URL: ' + requestDetails.url);
  if (requestDetails.requestBody.raw) {
    console.warn('body', requestDetails.requestBody);
    const data = requestDetails.requestBody.raw[0].bytes;
    console.warn('data', data);
    const json = String.fromCharCode.apply(null, new Uint8Array(data))
    console.warn('json', json);
    const base64s = JSON.parse(json).images_base64
    console.warn('base64s', base64s);
    const pngs = base64s.map((base64) => atob(base64))
    console.warn('str', pngs);

    sendPostReq(pngs);
  }
}

function sendPostReq(data) {
  var http = new XMLHttpRequest();
  var url = ENDPOINT;
  var dataJSON = JSON.stringify(data);
  http.open('POST', url, true);
  http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  http.onreadystatechange = function() {
    if (http.readyState == 4 && http.status == 200) {
      console.error(http.responseText);
    } else {
      console.warn('RESP ' + http.status);
    }
  };
  http.send(dataJSON);
}

browser.webRequest.onBeforeRequest.addListener(
  logURL,
  {
    urls: [pattern],
  },
  ['requestBody']
);
