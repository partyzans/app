console.warn('INJECTED!');
let alreadyRun = false;

function handleResponse(message) {
  console.log(`Response: ${message.response}`);
}

function handleError(error) {
  console.error(`Error: ${error}`);
}

function sendMessage(e) {
  var sending = browser.runtime.sendMessage({
    content: 'message from the content script',
  });
  sending.then(handleResponse, handleError);
}

function paintResults(res) {
  let results = JSON.parse(JSON.stringify(res));
  let table = document.getElementsByClassName('results-table')[0];
  if (typeof table == 'undefined' || table == null || table.rows.length == 0) {
    setTimeout(() => paintResults(results), 2500);
    return;
  } else {
    // set headline
    if (!alreadyRun) {
      alreadyRun = true;
      let row = table.rows[0];
      let x = row.insertCell(-1);
      x.classList.add('plus');
      x.innerHTML = 'Certainty';
    }
    let tempResults = results;
    results.forEach((result, index1) => {
      Object.keys(table.rows).forEach(index2 => {
        let ent = table.rows[index2].cells[0].textContent;
        if (ent === result.name) {
          tempResults.splice(index1, 1);
          if (table.rows[index2].cells.length < 6) {
            let row = table.rows[index2];
            let x = row.insertCell(-1);
            x.innerHTML = result.certainty;
          }
        }
      });
    });
    if (tempResults.length != 0) {
      const clone = JSON.parse(JSON.stringify(tempResults));
      console.warn('Repeat, not end yet', clone);
      setTimeout(() => paintResults(clone), 500);
    }
  }
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
    alreadyRun = false;
    paintResults(request.content);
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
