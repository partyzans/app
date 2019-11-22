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
    var data = requestDetails.requestBody.raw;
    var str = btoa(String.fromCharCode.apply(null, new Uint8Array(data)));

    console.warn('str', str);

    sendPostReq(str);
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
