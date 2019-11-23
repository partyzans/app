console.warn('INJECTED!');

function handleResponse(message) {
  console.log(`Response: ${message.response}`);
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

function sendMessage(e) {
  var sending = browser.runtime.sendMessage({
    content: 'message from the content script',
  });
  sending.then(handleResponse, handleError);
}

function paintResults(res) {
  let results = res;
  let table = document.getElementsByClassName('results-table')[0];
  if (typeof table === 'undefined' || table == null) {
    setTimeout(results => paintResults, 2000);
    return;
  }
  // set headline
  let row = table.rows[0];
  let x = row.insertCell(-1);
  x.classList.add('plus');
  x.innerHTML = 'Probability';

  Object.keys(table.rows).forEach(index => {
    console.warn('ROW ', index);
    if (index != 0) {
      let row = table.rows[index];
      let x = row.insertCell(-1);
      x.innerHTML = results[index].result;
    }
  });
}

function msgHandler(request, sender, sendResponse) {
  console.warn(request);
  if (request.type === 'FILE_LOAD') {
    sendResponse('file loaded');
  }
  if (request.type === 'SUBMIT') {
    NProgress.start();
  }
  if (request.type === 'RESULTS') {
    paintResults(request.content.results);
    NProgress.done();
  }
  sendResponse('ack');
  return true;
}

function afterWindowLoaded() {
  console.warn('loaded');
}

if (document.readyState !== 'complete') {
  window.addEventListener('load', afterWindowLoaded);
} else {
  afterWindowLoaded();
}

chrome.runtime.onMessage.addListener(msgHandler);
