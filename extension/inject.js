console.warn('INJECTED!');
let alreadyRun = false;
let tempNames = [];
sendMessage('RESET_COUNTER');

function handleResponse(message) {
  console.log(`Response: ${message.response}`);
}

function handleError(error) {
  console.error(`Error: ${error}`);
}

function sendMessage(data) {
  browser.runtime.sendMessage({
    content: data,
  });
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
        if (ent === tempNames[index1]) {
          tempResults.splice(index1, 1);
          if (table.rows[index2].cells.length < 6) {
            let row = table.rows[index2];
            let x = row.insertCell(-1);
            x.classList.add(getState(result));
            // count
            table.rows[index2].cells[1].classList.add(result.countdecision);
            // ellipsis - volume
            table.rows[index2].cells[2].classList.add(result.volumedecision);
            table.rows[index2].cells[3].classList.add(result.volumedecision);
            // purity
            table.rows[index2].cells[4].classList.add(result.puritydecision);
          }
        }
      });
    });
    if (tempResults.length != 0) {
      const clone = JSON.parse(JSON.stringify(tempResults));
      console.warn('Repeat, not end yet', clone);
      setTimeout(() => paintResults(clone), 500);
    } else {
      NProgress.done();
    }
  }
}

function msgHandler(request, sender, sendResponse) {
  console.warn(request);
  switch (request.type) {
    case 'FILE_LOAD':
      sendResponse('file loaded');
      break;
    case 'SUBMIT':
      NProgress.start();
      break;
    case 'RESULTS':
      alreadyRun = false;
      paintResults(request.content);
      break;
    case 'COUNT_NAMES':
      countNames();
      break;
  }
  sendResponse('ack');
  return true;
}

function countNames() {
  tempNames = [];
  let wrapper = document.getElementsByClassName('uploaded-images-list')[0];
  let allChilds = wrapper.getElementsByClassName('truncate-wrapper');
  for (let child of allChilds) {
    tempNames.push(child.innerText);
  }
}

function getState(res) {
  let states = [];
  states.push(res.countdecision);
  states.push(res.volumedecision);
  states.push(res.puritydecision);
  if (states.indexOf('critical') > -1) return 'wrong';
  if (states.indexOf('check') > -1) return 'medium';
  return 'super';
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
