console.warn('hello!');
const ENDPOINT = 'http://localhost:8000/upload/';
const GETPOINT = 'http://localhost:8000/results/';
const URL = 'isletnet.com';
const pattern = 'https://isletnet.com/api/*';
let tabId = 0;

browser.browserAction.onClicked.addListener(function() {
  chrome.tabs.query({}, function(tabs) {
    var doFlag = true;
    for (var i = tabs.length - 1; i >= 0; i--) {
      if (url_domain(tabs[i].url) === URL) {
        //your popup is alive
        doFlag = false;
        chrome.tabs.update(tabs[i].id, { active: true }); //focus it
        tabId = tabs[i].id;
        break;
      }
    }
    if (doFlag) {
      //it didn't found anything, so create it
      browser.tabs
        .create({ url: 'https://isletnet.com/' })
        .then(onCreated, onError);
    }
  });
});

function onCreated(newTab) {
  // Use setTimeOut to give the loaded page some time to register the message listener
  tabId = newTab.id;
}

function onError(err) {
  console.error('Eraaargh', err);
}

function url_domain(data) {
  var a = document.createElement('a');
  a.href = data;
  return a.hostname;
}

function handleMessage(request, sender, sendResponse) {
  console.log(`content script sent a message: ${request.content}`);
  setTimeout(() => {
    sendResponse({ response: 'async response from background script' });
  }, 1000);
  return true;
}

function sendMessage(type, content) {
  let sending = chrome.tabs.sendMessage(tabId, {
    type: type,
    content: content,
  });
  sending.then(handleResponse, handleError);
}

function handleResponse(message) {
  console.log(`Background response:: ${message}`);
}

function handleError(error) {
  console.log(`Background error:: ${error}`);
}

function logResponse(responseDetails) {
  console.log(responseDetails.url);
  console.log(responseDetails.statusCode);
}

function logURL(requestDetails) {
  // sendMessage('FILE_LOAD', 'tempFileName');
  // console.log('REQ: ' + JSON.stringify(requestDetails));

  if (requestDetails.url === 'https://isletnet.com/api/images/upload') {
    if (requestDetails.requestBody.raw) {
      const data = requestDetails.requestBody.raw[0].bytes;
      // console.warn('data', data);
      const json = String.fromCharCode.apply(null, new Uint8Array(data));
      // console.warn('json', json);
      const base64s = JSON.parse(json).images_base64;
      // console.warn('base64s', base64s);
      const pngs = base64s.map(base64 => atob(base64));
      // console.warn('str', pngs);
      sendPostReq(pngs);
    }
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

browser.runtime.onMessage.addListener(handleMessage);
browser.webRequest.onBeforeRequest.addListener(
  logURL,
  {
    urls: [pattern],
  },
  ['requestBody']
);

function getResults() {
  var req = new XMLHttpRequest();
  req.responseType = 'json';
  req.open('GET', GETPOINT, true);
  req.onload = function() {
    if (req.status == 200) {
      let jsonResponse = req.response;
      sendMessage('RESULTS', jsonResponse);
    } else {
      setTimeout(() => {
        getResults();
      }, 1500);
    }
  };
  req.send(null);
}

browser.webRequest.onCompleted.addListener(logResponse, {
  urls: [pattern],
});
