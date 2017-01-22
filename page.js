var PROXY_ADDRESS = "https://cors-anywhere.herokuapp.com/";

var NOTIFICATION_ID = '1';

var NOTIFICATION_OPTIONS = {
    type: "basic",
    title: "Primary Title",
    message: "Primary message to display",
    iconUrl: "clock.png"
}

var word_count = {};
var timeout_duration = 10000; // 10 SECONDS DEFAULT
var JSONresults;
var case_sensitive = false;


chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript(null, { file: "popup.js" });
});

function query() {
    chrome.storage.sync.get(["counter", "websites", "keywords", "flag", "timeout_duration", "case_sensitive"], function (result) {
        console.log(result.flag);
        console.log(result.counter);
        console.log(result.keywords);
        console.log(result.websites);


        if (result.timeout_duration !== undefined) {
            timeout_duration = result.timeout_duration;
        }

        if (result.case_sensitive !== undefined) {
            case_sensitive = result.case_sensitive;
        }


        if (result.flag == true) {

            var result_display = document.getElementById("display-results");
            result_display.innerHTML = "<div>";

            for (var i = 0; i < result.websites.length; i++) {
                performCORSRequest(result.websites[i], result.keywords);
            }

            console.log(JSON.stringify(word_count) + " // " + result.websites.length);
            for (var i = 0; i < result.websites.length; i++) {

                result_display.innerHTML += "<h4> Website #" + (i + 1) + ": <h4>";

                var keywords_array = word_count[result.websites[i]];

                console.log("Keywords array: " + keywords_array.toString());

                for (var j = 0; j < result.keywords.length; j++) {
                    result_display.innerHTML += result.keywords[j] + ": " + keywords_array[j] + " ";
                }

                result_display.innerHTML += "</hr>";
            }

            result_display.innerHTML += "</div>";

            word_count = {};
            console.log(JSON.stringify(word_count) + " // " + result.websites.length);

        }

    });

    setTimeout(query, timeout_duration);
}

query();


// RETRIEVE HTML CONTENTS OF WEBSITE WITH THE USE OF A CORS PROXY
function performCORSRequest(targetURL, keywords) {

    console.log("Entrance CORS method: " + targetURL + " // " + keywords);

    var request = false;
    request = new XMLHttpRequest();

    request.open('GET', PROXY_ADDRESS + targetURL, true);
    request.setRequestHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin");
    request.setRequestHeader("Access-Control-Allow-Headers", "X-Requested-With");
    request.setRequestHeader("Access-Control-Allow-Origin", "*");
    request.setRequestHeader("X-Requested-With", "*");
    request.onreadystatechange = function () {
        if (request.readyState === 4) {

            var occurrences_array = [];
            for (var i = 0; i < keywords.length; i++) {
                if (case_sensitive == false) {
                    occurrences_array.push(occurrences(request.responseText.replace(/(<([^>]+)>)/ig, "").toLowerCase(), keywords[i].toLowerCase()));
                } else {
                    occurrences_array.push(occurrences(request.responseText.replace(/(<([^>]+)>)/ig, ""), keywords[i]));
                }
            }

            word_count[targetURL] = occurrences_array;

        }
    };

    request.send();
}


/** Function that count occurrences of a substring in a string;
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}