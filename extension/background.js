console.warn('hello!');
const ENDPOINT = 'http://localhost:8000/upload/';
const GETPOINT = 'http://localhost:8000/poll/';
const URL = 'isletnet.com';
const pattern = 'https://isletnet.com/api/*';
let tabId = 0;
let counter = 0;
let dataSubmited = false;

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
  if (request.content === 'RESET_COUNTER') counter = 0;
  return true;
}

function sendMessage(type, content) {
  chrome.tabs.sendMessage(tabId, {
    type: type,
    content: content,
  });
}

function handleResponse(message) {
  console.log(`Background response:: ${message}`);
}

function handleError(error) {
  console.log(`Background error:: ${error}`);
}

function logResponse(responseDetails) {
  if (
    responseDetails.url === 'https://isletnet.com/api/isolation/submit' &&
    !dataSubmited
  ) {
    dataSubmited = true;
    sendMessage('SUBMIT', {});
    getResults();
  }
}

function logURL(requestDetails) {
  // sendMessage('FILE_LOAD', 'tempFileName');
  // console.log('REQ: ' + JSON.stringify(requestDetails));

  if (requestDetails.url === 'https://isletnet.com/api/images/upload') {
    dataSubmited = false;
    if (requestDetails.requestBody.raw) {
      const data = requestDetails.requestBody.raw[0].bytes;
      // console.warn('data', data);
      const enc = new TextDecoder('utf-8');
      const json = enc.decode(data);
      // console.warn('json', json);
      const base64s = JSON.parse(json).images_base64;
      // console.warn('base64s', base64s);
      // const pngs = base64s.map(base64 => atob(base64));
      base64s.forEach(base64 => {
        sendPostReq(base64);
      });
      sendMessage('COUNT_NAMES', {});
    }
  }
}

function sendPostReq(data) {
  var http = new XMLHttpRequest();
  var url = ENDPOINT;
  http.open('POST', url + counter, true);
  // http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  // http.setRequestHeader('Content-type', 'application/json');
  // http.setRequestHeader('Content-type', 'application/json');

  http.onreadystatechange = function() {
    if (http.readyState == 4 && http.status == 200) {
    } else {
      console.error('Post request error ' + http.status);
    }
  };
  http.send(data);
  counter++;
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
      sendMessage('RESULTS', JSON.parse(jsonResponse));
    } else {
      console.error('GET ERROR', req.status);
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
