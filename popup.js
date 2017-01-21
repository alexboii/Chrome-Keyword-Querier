
var errormsg = "";
var counter;
var flag = false;

var websites = [];
var keywords = [];

var duration_mantissa = document.getElementById("duration-field").value;
var duration_unit = document.getElementById("duration-options").value;
var case_sensitive = document.getElementById("case-sensitive-checkbox").checked;


// TODO: ADD INTERVAL ERROR CHECK (DO TESTS TO SEE MINIMAL LIMIT OF XML REQUEST)
// TODO: BETTER ERROR TEXT CSS STYLE 
// TODO: ADD SO THAT KEYWORDS GET ADDED UP AS DIFFERENT POPUPS LIKE IN TUMBLR 
// TODO: MAKE A "FANCIER"" NOTIFICATION POPUP
// TODO: NOTIFICATION WHEN KEYWORD CHANGES, KEYWORD FOUND
// TODO: SAVE RESULTS TO EXTERNAL TXT FILE 


chrome.storage.sync.get(["counter", "websites", "keywords", "duration_mantissa", "duration_unit", "case_sensitive"], function (result) {

  if (result.counter === undefined) {
    counter = 0;
  } else {
    counter = result.counter;
    keywords = result.keywords;
    addAllFields();
  }

  if (result.websites === undefined || result.websites.length == 0) {
    return;
  } else {
    websites = result.websites;
    fillAllFields();
  }

  if (result.duration_mantissa === undefined || result.duration_mantissa <= 0) {
    return;
  } else {
    duration_mantissa = result.duration_mantissa;
    document.getElementById("duration-field").value = duration_mantissa;
  }

  if (result.duration_unit === undefined || result.duration_unit <= 0) {
    return;
  } else {
    duration_unit = result.duration_unit;
    document.getElementById("duration-options").value = duration_unit;
  }

  if (result.case_sensitive === undefined) {
    return;
  } else {
    case_sensitive = result.case_sensitive;
    document.getElementById("case-sensitive-checkbox").checked = case_sensitive;
  }

});

function error(errorstr) {
  document.getElementById("error-message").style.visibility = "visible";

  if (errorstr.charAt(errorstr.length - 2) == "," && errorstr.charAt(errorstr.length - 1) == " ") {
    var errorbuffer = errorstr.substring(0, errorstr.length - 2);
    document.getElementById("error-message").innerHTML = errorbuffer;
  } else {
    document.getElementById("error-message").innerHTML = errorstr;
  }

  errormsg = "";
}

function hideError() {
  document.getElementById("error-message").style.visibility = "hidden";
}

function addAllFields() {

  var temp_counter = counter;
  counter = 0;
  for (var i = 0; i < temp_counter; i++) {
    moreFields();
  }

}

function fillAllFields() {
  for (var i = 1; i <= websites.length; i++) {
    document.getElementById("enter-website-" + i).value = websites[i - 1];
  }

  document.getElementById("keywords-field").value = keywords.join(", ");

}


function moreFields() {
  counter++;
  var newFields = document.getElementById("input-website").cloneNode(true);
  newFields.id = "enter-website-" + counter;
  newFields.style.display = "block";

  var newField = newFields.childNodes;

  for (var i = 0; i < newField.length; i++) {
    var theName = newField[i].name
  }

  if (theName) {
    newField[i].name = theName + counter;
  }

  var insertHere = document.getElementById("writeroot");
  insertHere.parentNode.insertBefore(newFields, insertHere);

  chrome.storage.sync.set({ 'counter': counter }, function () { });
}

function remove() {
  var elem = document.getElementById("enter-website-" + counter);
  elem.remove();
  counter--;
  chrome.storage.sync.set({ 'counter': counter }, function () { });

}


function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the link that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request['request_type'] === 'copy') {
      storage.clear();
      storage.set({ 'form_data': request['form_data'] });
    } else if (request['request_type'] === 'paste') {
      storage.get('form_data', function (item) {
        chrome.tabs.getSelected(null, function (tab) {
          chrome.tabs.sendMessage(tab.id, item['form_data']);
        });
      });
    }
  });

document.getElementById("add-fields").onclick = moreFields;
document.getElementById("remove-field").onclick = remove;
document.getElementById("options-tab").onclick = function () { openTab(event, "Selection") };
document.getElementById("results-tab").onclick = function () { openTab(event, "Results") };

document.getElementById("options-tab").click();


// REGEX COURTESY OF MATTHEW O'RIORDAN FROM STACK OVERFLOW 
var urlpattern = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);

window.onload = function () {
  document.getElementById("refresh-field").onclick = function () {

    keywords.length = 0;

    if (document.getElementById("keywords-field").value.length != 0) {
      keywords = document.getElementById("keywords-field").value.split(",");
    }

    if (keywords === undefined || keywords.length == 0) {
      errormsg += "Please enter at least one keyword, ";
    } else {
      // TRIM SPACES FROM BEGINNING AND END OF EACH KEYWORD
      for (var i = 0; i < keywords.length; i++) {
        keywords[i] = keywords[i].replace(/^\s\s*/, "").replace(/\s\s*$/, "");
      }

      hideError();

    }

    websites.length = 0;
    var control_bool = false;
    for (var i = 1; i <= counter; i++) {
      var elem = document.getElementById("enter-website-" + i).value;
      if (!urlpattern.test(elem)) {
        errormsg += "Invalid URL on field #" + i + ", ";
      } else {
        websites.push(elem);
        control_bool = true;
      }
    }

    duration_unit = document.getElementById("duration-options").value;
    duration_mantissa = document.getElementById("duration-field").value;
    case_sensitive = document.getElementById("case-sensitive-checkbox").checked;
    var timeout_duration = 10000;

    if ((duration_mantissa === undefined || duration_mantissa <= 0)) {
      errormsg += "Please enter the duration of your query interval, ";
    } else {
      chrome.storage.sync.set({ 'duration_mantissa': duration_mantissa }, function () { });
      chrome.storage.sync.set({ 'duration_unit': duration_unit }, function () { });
      timeout_duration = duration_unit * duration_mantissa;
    }


    if ((websites === undefined || websites.length == 0) && control_bool) {
      errormsg += "Please enter at least one website, ";
    }

    if (errormsg != "") {
      flag = false;
      error(errormsg);
    } else {
      flag = true;
    }

    chrome.storage.sync.set({ 'flag': flag }, function () { });
    chrome.storage.sync.set({ 'websites': websites }, function () { });
    chrome.storage.sync.set({ 'keywords': keywords }, function () { });
    chrome.storage.sync.set({ 'timeout_duration': timeout_duration }, function () { });
    chrome.storage.sync.set({ 'case_sensitive': case_sensitive }, function () { });

  }
}

// Tests the roundtrip time of sendRequest().
function testRequest() {
  setChildTextNode("resultsRequest", "running...");

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var timer = new chrome.Interval();
    timer.start();
    var tab = tabs[0];
    chrome.tabs.sendRequest(tab.id, { counter: 1 }, function handler(response) {
      if (response.counter < 1000) {
        chrome.tabs.sendRequest(tab.id, { counter: response.counter }, handler);
      } else {
        timer.stop();
        var usec = Math.round(timer.microseconds() / response.counter);
        setChildTextNode("resultsRequest", usec + "usec");
      }
    });
  });
}

// Tests the roundtrip time of Port.postMessage() after opening a channel.
function testConnect() {
  setChildTextNode("resultsConnect", "running...");

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var timer = new chrome.Interval();
    timer.start();

    var port = chrome.tabs.connect(tabs[0].id);
    port.postMessage({ counter: 1 });
    port.onMessage.addListener(function getResp(response) {
      if (response.counter < 1000) {
        port.postMessage({ counter: response.counter });
      } else {
        timer.stop();
        var usec = Math.round(timer.microseconds() / response.counter);
        setChildTextNode("resultsConnect", usec + "usec");
      }
    });
  });
}

