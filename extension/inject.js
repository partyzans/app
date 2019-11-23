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

function msgHandler(request, sender, sendResponse) {
  console.warn(request);
  if (request.type === 'FILE_LOAD') {
    sendResponse('file loaded');
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
