const key1MSUnifiedSpeechAPI = "318dd88e400d4ac48bf3740a108a565d";
const regionCode = "westus";

//const key1MSUnifiedSpeechAPI = "54b1b031c6msh1d90d8db06bc946p115151jsn85d0cfde6b34";
//const regionCode = "eastus";

// Copy convention of having a global scope copy of of window.SpeechSDK
var SpeechSDK;
var speechConfig = undefined;
var audioConfig = undefined;
var recognizer = undefined;

var phrasesAsRecorded = [];
var phrasesTranslated = [];

$(document).ready(function() {
  function lightningToAnimated() {
    $(".gif").attr("src", $(".gif").attr("data-animate"));
    $(".gif").attr("data-state", "animate");
  }

  function lightningToStill() {
    $(".gif").attr("src", $(".gif").attr("data-still"));
    $(".gif").attr("data-state", "still");
  }

  $("#start").on("click", function(event) {
    /* {{{ **
    ** initializeSpeechSDK();
    ** }}} */
    /* {{{ **
    ** // Just record one utterance then stop
    ** recognizer.recognizeOnceAsync(result => {
    **   // Interact with result
    **   $("#text-display").text(result.text);
    ** });
    ** }}} */
    // First set up the events for recognition
    // Function hooked up for recognized event with finalized answer
    recognizer.recognized = function (s, e) {
      if (e.result.reason !== SpeechSDK.ResultReason.NoMatch) {
        // Have a recognized phrase, so
        // Store it to array
        phrasesAsRecorded.push(e.result.text)
        // Display all the snippets starting each one on its own line
        $("#text-display").text(phrasesAsRecorded.join("\n"));
        // Pass to callback for translation
        passPhraseToMSTranslator(phrasesAsRecorded.length-1,'de');
      } else {
      }
    }
    // Starts recognition
    recognizer.startContinuousRecognitionAsync();
    // Start the lightning animation as feedback
    lightningToAnimated();

  });

  $("#stop").on("click", function(event) {
    recognizer.stopContinuousRecognitionAsync(
        function () {
            /* {{{ **
            ** recognizer.close();
            ** recognizer = undefined;
            ** }}} */
        },
        function (err) {
            /* {{{ **
            ** recognizer.close();
            ** recognizer = undefined;
            ** }}} */
        });
    // Stop the lightning animation as feedback
    lightningToStill();
  });

  function passPhraseToMSTranslator(phraseIndex, lang) {
    //URL PATTERN: {{{
    //https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=es
    //sample value }}}
    var queryURL = "https://api.cognitive.microsofttranslator.com/translate?"
    var queryObj = {
      'api-version':'3.0',
      to:'de'
    };
    var callObj = {
      url: '',
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': 'a9b0d0e3a840456a8257618e073be609',
        'content-type': 'application/json',
      },
      data: ''
    }
    var escaped = '';
    // Assemble query url and call data
    if (lang) {
      queryObj.to = lang;
    }
    queryURL += $.param(queryObj);
    // Set call url to constructed value
    callObj.url = queryURL;
    // Set data property to an object with property Text inside an array
    console.log('∞° phrasesAsRecorded[phraseIndex]="'+phrasesAsRecorded[phraseIndex],'"');
    escaped = phrasesAsRecorded[phraseIndex].replace(/'/g,"\\'");
    console.log('∞° escaped="'+escaped,'"');
    callObj.data = "[{'Text':'"+escaped+"'}]";
    // Make asynchronous API call
    $.ajax(callObj).then(function (response) {
      var retData = '';
      retData = response[0].translations[0].text;
      phrasesTranslated.push(retData);
      console.log('response=\n'+JSON.stringify(response));
      // Display all the snippets starting each one on its own line
      $("#text-display").text(phrasesTranslated.join("\n"));
      $("#translated-display").text(phrasesTranslated.join("\n"));
    }).catch(function(e) {;
      console.log('in phrasesTranslated .catch() e=\n'+JSON.stringify(e));
      phrasesTranslated.push('Err: '+e.message);
    });
  }

  function initializeSpeechSDK() {
    speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key1MSUnifiedSpeechAPI, regionCode);
    audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  }
  // Copy convention of having a global scope copy of of window.SpeechSDK
  SpeechSDK = window.SpeechSDK;
  initializeSpeechSDK();
});
