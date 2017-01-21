var PROXY_ADDRESS = "https://cors-anywhere.herokuapp.com/";

var NOTIFICATION_ID = '1';

var NOTIFICATION_OPTIONS = {
    type: "basic",
    title: "Primary Title",
    message: "Primary message to display",
    iconUrl: "clock.png"
}

var word_count = [];
var JSONresults;

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript(null, { file: "popup.js" });
});

function query() {
    chrome.storage.sync.get(["counter", "websites", "keywords", "flag"], function (result) {
        console.log(result.flag);
        console.log(result.counter);
        console.log(result.keywords);
        console.log(result.websites);


        if (result.flag == true) {
            var try2 = document.getElementById("display-results");
            try2.innerHTML += "<div>";
            var results_string = "";


            for (var i = 0; i < result.websites.length; i++) {
                results_string = "";
                JSONresults = "";
                var website_name = "<h4> Website #" + (i + 1) + ": <h4>";
                try2.innerHTML += website_name;

                performCORSRequest(result.websites[i], result.keywords);

                console.log("BRO WHAT?");

                if (word_count.length != 0) {
                    for (var j = 0; j < word_count.length; j++) {
                            results_string += JSON.stringify(JSONresults[j].keyword) + ": " + JSON.stringify(JSONresults[j].occurrences) + "\n";
                            console.log(results_string);
                    }
                }

                console.log("BROSKI: " + results_string);

                try2.innerHTML += "<p>" + results_string + "</p>";
                
                word_count.length = 0;

            }

            try2.innerHTML += "</div><hr>";
        }

        // if (result.flag == false) {
        //     document.getElementById("error-message").style.visibility = "visible";
        //     document.getElementById("error-message").innerHTML = "hello";
        // }


    });


    setTimeout(query, 10000);
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
            console.log("Length: " + keywords.length);
            for (var i = 0; i < keywords.length; i++) {
                word_counter.push(occurrences(request.responseText.replace(/(<([^>]+)>)/ig, "").toLowerCase());
            }

        }

    };


    JSONresults = JSON.parse(JSON.stringify(word_count));
    console.log("HERE:" + word_count);
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