/*Beta V1.4 teacher's version*/
//setup global variables
var targetWords = [];
var starTW = [];
var definitions = {};
var translations = {};
var GuessAnswer = []
var synonyms = {};
var defShown = [];
var translShown = []
var exSenFinal = {}; // create an empty object to save example sentences
var queue = [];
var textLoaded = 0 //for tab1 to see if a text has ever been loaded
var senInText = [];
var TWretrieved = 0 //for tab1 to see if targetWords has ever been retrieved
var curSenSet = 0;
var makeSenClicked = 0
var abort = 0
var textStudied = []
var senNumValue = 1
var generatingSen = false;
var blankAnswerKey = {}
var answerList = []
var selectedBlankTW = [];
var customizeRange = 0;
var selectedWordCount = 0
const sendPromptDelay = 1000;
var responses = {};
let wordsList = { level2: [], level3: [], level4: [], level5: [] };

//for testing tab4
/*const blankNum = document.getElementById("blankNum")
genNumOpt(blankNum, 1, 3);*/

//for genreal testing
/*targetWords = ["apple", "banana", "cake"];
definitions = ["def1", "def2", "def3"];
exSenFinal = {
  apple: ["Apples are red1are red1are red1are red1are red1are red1are red1are red1are red1.", "apples are red2.", "apples are red3."],
  banana: ["bananas are yellow1", "banana are yellow2", "banana are yellow3"],
  cake: ["cakes are brown1", "cakes are brown2", "cakes are brown3"]
};
textStudied = ['The', 'development', 'of', 'the', 'modern', 'presidency', 'in', 'the', 'United', 'States', 'began', 'with', 'Andrew', 'Jackson,', 'who', 'swept', 'to', 'power', 'in', '1829', 'at', 'the', 'head', 'of', 'the', 'Democratic', 'Party', 'and', 'served', 'until', '1837.', 'During', 'his', 'administration', 'he', 'immeasurably', 'enlarged', 'the', 'power', 'of', 'the', 'presidency.', '“The', 'President', 'is', 'the', 'direct', 'representative', 'of', 'the', 'American', 'people,”', 'he', 'lectured', 'the', 'Senate', 'when', 'it', 'opposed', 'him.', '“He', 'was', 'elected', 'by', 'the', 'people,', 'and', 'is', 'responsible', 'to', 'them.”', 'With', 'this', 'declaration,', 'Jackson', 'redefined', 'the', 'character', 'of', 'the', 'presidential', 'office', 'and', 'its', 'relationship', 'to', 'the', 'people.']*/


//prevent accidental reload of the page
window.onbeforeunload = function() {
  return "Data will be lost if you leave the page, are you sure?";
};


//initialize senNum dropdownlist
const senNum = document.getElementById("senNum");
genNumOpt(senNum, 3, 8) //set the min and max number for SenNum

// Show the default active tab
document.getElementById("Tab1").style.display = "block";
document.getElementsByClassName("tablinks")[1].className += " active";

//load vocabulary list on page load
window.onload = loadCSV;


//================== miscellaneous ===========================

function changeDivDisplay(id, displayValue) {
  document.getElementById(id).style.display = displayValue
}

function scrollToElement(id) {
  const element = document.getElementById(id);
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

//================== Matching Voc ===========================



function loadCSV() {
  Promise.all([
    fetch('level2.csv').then(response => response.text()),
    fetch('level3.csv').then(response => response.text()),
    fetch('level4.csv').then(response => response.text()),
    fetch('level5.csv').then(response => response.text())
  ])
    .then(data => {
      wordsList.level2 = data[0].split(',').map(word => word.trim().toLowerCase());
      wordsList.level3 = data[1].split(',').map(word => word.trim().toLowerCase());
      wordsList.level4 = data[2].split(',').map(word => word.trim().toLowerCase());
      wordsList.level5 = data[3].split(',').map(word => word.trim().toLowerCase());
    })
    .catch(error => console.error('Error loading CSVs:', error));
}



function matchWords() {
  //removeAllHighlights()
  const selectedLevels = [];
  ['level2', 'level3', 'level4', 'level5'].forEach(level => {
    if (document.querySelector(`input[name="${level}"]`).checked) {
      selectedLevels.push(level);
    }
  });

  const inputWords = textStudied;
  const matchedWords = new Set();

  inputWords.forEach(word => {
    selectedLevels.forEach(level => {
      if (word.length > 1) {
        let levelList = wordsList[level];
        console.log(levelList)
        if (levelList && levelList.includes(word)) {
          matchedWords.add(word);
        }

        // Singular and past tense forms
        let singularForms = getSingularForm(word);
        singularForms.forEach(singularForm => {
          if (levelList && levelList.includes(singularForm)) {
            matchedWords.add(word);
          }
        });

        let adjForms = getAdjForm(word)
        adjForms.forEach(adjForm => {
          if (levelList && levelList.includes(adjForm)) {
            matchedWords.add(word);
          }
        });


        let pastTenseForms = getPastTenseForm(word);
        pastTenseForms.forEach(pastTenseForm => {
          if (levelList && levelList.includes(pastTenseForm)) {
            matchedWords.add(word);
          }
        });
      }
    });
  });

  highlightMatchedWords(matchedWords);
}




function getSingularForm(word) {
  let forms = [];
  if (word.endsWith('ies')) {
    forms.push(word.slice(0, -3) + 'y');
  }
  if (word.endsWith('es')) {
    forms.push(word.slice(0, -2));
  }
  if (word.endsWith('s')) {
    forms.push(word.slice(0, -1));
  }
  console.log("forms:\n", forms)
  return forms; // Returns an array of possible singular forms
}

function getAdjForm(word) {
  let forms = [];

  if (word.endsWith('ly')) {
    forms.push(word.slice(0, -2));
  }

  console.log("forms:\n", forms)
  return forms; // Returns an array of possible singular forms
}

function getPastTenseForm(word) {
  let forms = [];
  if (word.endsWith('ied')) {
    forms.push(word.slice(0, -3) + 'y');
  }
  if (word.endsWith('ed')) {
    forms.push(word.slice(0, -1));
    forms.push(word.slice(0, -2));
    // Consider a case where a word ends with 'eed' and only 'ed' is removed
    if (word.length > 2 && word[word.length - 3] === 'e') {
      forms.push(word.slice(0, -1));
    }
  }
  console.log("forms:\n", forms)
  return forms
}


function highlightMatchedWords(matchedWords) {
  const highlightedSet = new Set();
  spanElements = document.querySelectorAll("#spannedText span");

  spanElements.forEach(span => {
    const word = span.textContent.toLowerCase();

    if (matchedWords.has(word) && !highlightedSet.has(word)) {
      span.classList.add("highlighted");
      highlightedSet.add(word);
    } else {
      //span.classList.remove("highlighted");
    }
  });

  countHighlightedSpan();
}

function removeAllHighlights() {
  const spanElements = document.querySelectorAll("#spannedText span");

  spanElements.forEach(span => {
    span.classList.remove("highlighted");
  });
  countHighlightedSpan()
}



//================== LocalStorage Related ===========================

function loadStudySetFromDevice(event) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';

  fileInput.onchange = function(event) {
    const input = event.target;
    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = function(e) {
      const jsonContent = e.target.result;
      const data = JSON.parse(jsonContent);
      processJSONData(data);
    };

    reader.readAsText(file);
  };

  fileInput.click();
}

function loadStudySetFromLocalStorage() {
  const fileName = document.getElementById("set-select").value
  const jsonData = localStorage.getItem(fileName);
  const data = JSON.parse(jsonData)
  processJSONData(data);
}

function processJSONData(data) {
  // Use the loaded JSON data
  // load Step1
  document.getElementById("targettext").value = data.text;
  loadText();
  targetWords = data.targetWords;
  starTW = data.starTW;
  data.targetWords.forEach(word => {
    const span = Array.from(spannedText.children).find(span => span.innerText === word);
    if (span) {
      span.classList.add("highlighted");
    }
  });
  //counthighlighted words
  const wordCounter = document.getElementById("wordCounter");
  countHighlightedSpan();
  tab1result(targetWords)

  //load Step2
  exSenFinal = data.exSenFinal;
  definitions = data.definitions;
  translations = data.translations;
  synonyms = data.synonyms;
  setupTab2ResultDisplay();
  const selectElement = document.getElementById("wordDropdown");
  for (const key in exSenFinal) {
    const optionElement = document.createElement("option");
    optionElement.value = key;
    optionElement.textContent = key;
    selectElement.appendChild(optionElement);
  }
  refreshSen();
  document.getElementById("guessContainer").style.display = "grid";
  loadGuessAnswer();
  document.getElementById("tabButtonStep1").click();
  makeButtonRegular('makeSentenceButton');
  initializeBlankNum();
}

function listLocalStorage() {
  // Get the file names from local storage
  const fileNames = Object.keys(localStorage);

  // Populate the select element with file names
  const setSelect = document.getElementById('set-select');
  setSelect.innerHTML = "";

  if (fileNames.length == 0) {
    const option = document.createElement('option');
    option.value = 0
    option.text = "瀏覽器內無學習集"
    setSelect.appendChild(option);
  }
  fileNames.forEach(fileName => {
    if (fileName != "上次學習階段暫存") {
      const option = document.createElement('option');
      option.value = fileName;
      option.text = fileName;
      setSelect.appendChild(option);
    }
  });
}

function retrieveStudySetData() {
  const text = document.getElementById("targettext").value;
  const combinedData = {
    text: text,
    exSenFinal: exSenFinal,
    definitions: definitions,
    translations: translations,
    synonyms: synonyms,
    targetWords: targetWords,
    starTW: starTW
  };

  const jsonString = JSON.stringify(combinedData, null, 2);
  return jsonString;
}

function saveStudySetToDevice() {
  jsonString = retrieveStudySetData();
  fileName = document.getElementById("fileName").value;
  const link = document.createElement('a');
  link.href = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
  link.download = fileName + '.json';
  //document.body.appendChild(link);
  link.click();
}

function saveStudySetToLocalStorage() {
  jsonString = retrieveStudySetData();
  fileName = document.getElementById("fileName").value;
  localStorage.setItem(fileName, jsonString);
  alert('學習集已儲存');
}

function backupProgress() {
  jsonString = retrieveStudySetData();
  fileName = "上次學習階段暫存";
  localStorage.setItem(fileName, jsonString);
}

function loadPrevResultFromLocalStorage() {
  const jsonData = localStorage.getItem("上次學習階段暫存");
  data = JSON.parse(jsonData)
  if (jsonData) {
    processJSONData(data);
  } else {
    alert("瀏覽器中無暫存資料")
  }
}


function openTab(evt, tabName) {
  // Declare variables
  var i, tabcontent, tablinks;

  // Hide all tab content
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Remove the "active" class from all tab links
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

function isTabActive(tabId) {
  var tabContent = document.getElementsByClassName('tabcontent');
  for (var i = 0; i < tabContent.length; i++) {
    if (tabContent[i].id === tabId && tabContent[i].style.display !== 'none') {
      return true;
    }
  }
  return false;
}


function genNumOpt(selectElement, min, max) {
  for (let i = min; i <= max; i++) {
    const optionElement = document.createElement("option");
    optionElement.value = i;
    optionElement.text = i;
    selectElement.add(optionElement);
  }
  selectElement.selectedIndex = 2
}

function removeAllOptions(selectId) {
  var selectElement = document.getElementById(selectId);

  while (selectElement.options.length > 0) {
    selectElement.remove(0);
  }
}

function clearText() {
  document.querySelector('#targettext').value = ''
}



function loadText() {
  //change button color
  makeButtonRegular("loadTextButton");

  // Get the tab container and text element
  const textElement = document.getElementById("targettext");

  const container = document.getElementById("loadResult");

  // Split the text into an array of words
  const replacedWords = [];//record the words that should be automatically highlighted
  const text = textElement.value.replace(/([A-Za-z]+)\d+/g, (match, word) => {
    replacedWords.push(word);
    return word;
  });

  const matches = text.match(/(\w+|[.,?!;:'"’%*-—()]|[\n])/g);
  const words = matches || [];
  console.log(words)

  senInText = textElement.value.split(/[.!?]/);
  textStudied = words;

  // Create containers for the text with the <span> elements
  if (textLoaded == 0) {
    document.getElementById("selectGuide").style.display = "block";
    const spannedText = document.createElement("p");
    spannedText.setAttribute("id", "spannedText");
    container.appendChild(spannedText);
    const retrieveButton = document.createElement("button");
    retrieveButton.textContent = "確認/更新選取";
    retrieveButton.className = "dominantButton";
    retrieveButton.id = "retrieveButton"
    retrieveButton.addEventListener('click', retrieveTargetWords);
    container.appendChild(retrieveButton);
    textLoaded = 1;
  }

  spannedText.innerHTML = words.map((word, index) => {
    // Check if the word should be highlighted
    const shouldHighlight = replacedWords.includes(word);
    const spanClass = shouldHighlight ? "highlighted" : "";
    // Replace '/n' with '<br>'
    // Replace '/n' with '<br>'
    // Replace '\n' with '<br>'
    const processedWord = word.replace(/\n/g, "<br>");

    return `<span id="word${index + 1}" class="${spanClass}">${processedWord}</span>`;
  })
    .join(" ");

  spannedText.style.fontSize = "x-large";
  scrollToElement('autoMatchButton')

  // Add a click event listener to each <span> element
  const spanElements = document.querySelectorAll("#spannedText span");
  spanElements.forEach(span => {
    span.addEventListener("click", () => {
      wordCounter = document.getElementById("wordCounter");
      if (span.classList.contains("highlighted")) {
        // Remove highlight
        span.classList.remove("highlighted");
        countHighlightedSpan();
      } else {
        // Add highlight
        span.classList.add("highlighted");
        countHighlightedSpan();
      }
    });
  });

  countHighlightedSpan();
}


function countHighlightedSpan() {
  let selectedWordCount = 0;
  const seenText = new Set(); // A set to keep track of unique texts
  const spanElements = document.querySelectorAll("#spannedText span");

  spanElements.forEach(span => {
    if (span.classList.contains("highlighted")) {
      const textContent = span.textContent.trim(); // Get the text content of the span

      // Check if we've already seen this text
      if (!seenText.has(textContent)) {
        seenText.add(textContent); // Add new text to the set
        selectedWordCount += 1;    // Increase count only if the text is unique
      }
    }
  });

  wordCounter.innerHTML = "已標記" + selectedWordCount + "個單字";
}


function retrieveTargetWords() {
  makeButtonRegular("retrieveButton")
  makeButtonDominant("tab1ToTab2Button")
  const highlightedWords = document.querySelectorAll("#spannedText span.highlighted");
  targetWords = Array.from(highlightedWords).map(span => span.innerText).filter((value, index, self) => {
    return self.indexOf(value) === index;
  });

  /*if (targetWords.length > 17) {
    alert("標記太多單字囉! 每天請不要學習超過15個單字，否則效果會大打折扣的! 若一個段落中有過多生字，請將此段落拆成多天練習。");
    return;
  }*/
  console.log(targetWords)
  tab1result(targetWords);
  updateQueueDisplay()

  //save tab1result to local storage
  backupProgress();
}

function saveTargetWords() {
  const twInput = document.getElementById("targettext").value;
  targetWords = twInput.split(',').map(element => element.trim());
  tab1result(targetWords);
}

function tab1result(targetWords) {
  if (targetWords.length == 0) {
    alert("請先選取目標單字")
  } else {
    const stringTW = "已選擇目標單字: " + targetWords.map(element => element.toString()).join(", ");
    console.log(TWretrieved);
    const selectedWords = document.getElementById("selectedWords");
    const tab1toTab2 = document.getElementById("tab1toTab2");
    selectedWords.innerHTML = stringTW;
    document.getElementById("modifyTWButtonContainer").style.display = "block";
    tab1toTab2.style.display = "block";
    window.scrollTo(0, document.body.scrollHeight);
  }
}

function modifyTW() {
  // Get the dropdown, input, and button elements
  document.getElementById("modifyTW").style.display = "block";
  const dropdown = document.getElementById('modifyTWDropdown');
  const inputText = document.getElementById('changeTW');
  const applyBtn = document.getElementById('apply-change-btn');

  // Populate the dropdown with options based on targetWords array
  while (dropdown.options.length > 0) {
    dropdown.remove(0);
  }
  for (let i = 0; i < targetWords.length; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.text = targetWords[i];
    dropdown.appendChild(option);
  }
  inputText.value = targetWords[0]
  // Event listener for the dropdown change
  dropdown.addEventListener('change', () => {
    // Get the selected index from the dropdown
    const selectedIndex = parseInt(dropdown.value);

    // Load the selected element into the input field
    inputText.value = targetWords[selectedIndex];
  });

  // Event listener for the apply button click
  applyBtn.addEventListener('click', () => {
    // Get the selected index from the dropdown
    const selectedIndex = parseInt(dropdown.value);


    // Update the targetWords array with the modified value from the input field
    targetWords[selectedIndex] = inputText.value;

    // Update the corresponding dropdown list option with the input value
    dropdown.options[selectedIndex].text = inputText.value;
    // Log the updated targetWords array
    console.log(targetWords);

    // Call the tab1result function with the updated targetWords array
    tab1result(targetWords);

    //save tab1result to local storage
    saveTab1ResultToLocalStorage()
    console.log(targetWords)
    console.log("result saved")

  });
}

function addToQueue(toExam, ref, queueArray) {
  toExam.forEach(function(word) {
    if (!ref.hasOwnProperty(word) && !queueArray.includes(word)) {
      queueArray.push(word);
      console.log("queue has been updated: " + queue)
    }
    console.log("no new item added to queue")
  });
}

function tab1ToTab2() {
  const button = document.getElementById("tabButtonStep2");
  button.click();
}

function updateQueueDisplay() {
  queue.length = 0;
  addToQueue(targetWords, exSenFinal, queue)
  const queueDisplayContainer = document.getElementById("queueDisplay")
  queueDisplay.innerHTML = "(即將產生例句之單字: \n" + queue.map(element => element.toString()).join(", ") + ")";
}





//============================= Tab2 =========================================
function resetExSenDisplay() {
  //removeAllElement("titleContainer");
  removeAllElement("senContainer");
  removeAllElement("defContainer");
  removeAllElement("progressContainer");
}

function getSenInText(tw) {

  // Iterate through each sentence
  for (const sentence of senInText) {
    // Check if the sentence contains the target word
    if (sentence.toLowerCase().includes(tw.toLowerCase())) {
      return sentence.trim();
    }
  }

  // Return null if the target word is not found in any sentence
  return null;
}

function trimResult(targetString) {
  var resultTrimmed = targetString;
  var trimKeywords = ['translation:', 'easy definition:', 'definition:', 'synonyms'];

  trimKeywords.forEach(function(keyword) {
    var regex = new RegExp(keyword, 'i');
    var index = resultTrimmed.search(regex);

    if (index != -1) {
      resultTrimmed = resultTrimmed.substring(0, index);
    }
  });

  return resultTrimmed;
}

function setupTab2ResultDisplay() {
  //get the target tab
  const tabContainer = document.querySelector('#Tab2');

  //show the edit buttons
  document.getElementById('reMakeSenButton').style.display = "inline-block";
  document.getElementById('editSenButton').style.display = "inline-block";
  document.getElementById('deleteTWButton').style.display = "inline-block";

  //style the title container
  const titleContainer = document.getElementById("titleContainer")
  titleContainer.style.display = "flex";
  titleContainer.style.alignItems = "center";
  titleContainer.style.margin = "auto";
  titleContainer.style.justifyContent = "space-between";

  //get container for sentences
  const senContainer = document.getElementById("senContainer");
  senContainer.style.display = "flex";
  senContainer.style.flexDirection = "column";
  senContainer.style.margin = "auto";

  //style definition container
  const defContainer = document.getElementById("defContainer");
  defContainer.style.display = "block";
  defContainer.style.alignItems = "center";
  defContainer.style.margin = "auto";
  defContainer.style.justifyContent = "space-between";


}

function wipeExSenFinal() {
  const wipeCheck = confirm("這將會清除所有例句，你確定嗎?")
  if (wipeCheck) {
    for (const key in exSenFinal) {
      delete exSenFinal[key];
    }
    document.getElementById("titleContainer").style.display = "none";
    document.getElementById("senContainer").style.display = "none";
    document.getElementById("guessContainer").style.display = "none";
    document.getElementById("defContainer").style.display = "none";
    const selectElement = document.getElementById("wordDropdown");
    while (selectElement.options.length > 0) {
      selectElement.remove(0);
    }
    document.getElementById("progress").innerHTML = "例句已清除。"
  }
}

function abortMakeSentence() {
  const abortCheck = confirm("這將停止產生例句，你確定嗎?")
  if (abortCheck) {
    abort = 1;
    document.getElementById("progress").innerHTML = "產生例句停止中..."
  }
}
function deleteTW() {
  const deleteCheck = confirm("將刪除本單字之例句、定義、翻譯及同義詞，請問是否確定要刪除?")
  if (deleteCheck == 0) {
    return;
  }
  const wordDropdown = document.getElementById('wordDropdown')
  const editedTW = wordDropdown.value

  //remove exSen, definition, translation and synonym
  delete exSenFinal[editedTW];
  delete definitions[editedTW];
  delete translations[editedTW];
  delete synonyms[editedTW];

  for (let i = 0; i < wordDropdown.options.length; i++) {
    if (wordDropdown.options[i].value === editedTW) {
      wordDropdown.remove(i);
      wordDropdown.value = wordDropdown.options[i + 1].value
      break; // Exit the loop once the option is removed
    }
  }
  refreshSen();
}

function editSen() {

  //display the edit interface

  const popup = document.getElementById('editSenPopup');
  popup.style.width = 0.85 * window.innerWidth + "px"
  popup.style.height = 0.9 * window.innerHeight + "px"
  popup.style.left = 0.05 * window.innerWidth + "px";
  // Calculate the top position based on the current scroll position
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  popup.style.top = scrollTop + 0.03 * window.innerHeight + 'px';
  popup.style.display = "block";
  const textBoxWidth = 0.95 * parseFloat(popup.style.width) + "px"
  //populate the edit interface
  //adding a title for TW
  const editedTW = document.getElementById('wordDropdown').value
  const container = document.getElementById('editSenTextboxContainer')
  const title = document.createElement('h4')
  title.innerHTML = editedTW
  container.appendChild(title)

  //adding the example sentences
  const senNumCurrSet = exSenFinal[editedTW].length

  for (i = 0; i < senNumCurrSet; i++) {
    const editingExSen = exSenFinal[editedTW][i].trim();
    const textBox = document.createElement('textarea');
    textBox.value = editingExSen;
    textBox.style.display = "Block";
    textBox.style.margin = "10px"
    textBox.style.width = textBoxWidth
    textBox.style.boxSizing = "border-box"; // Include padding and border in width calculation
    textBox.style.whiteSpace = "normal"; // Allow text to wrap
    container.appendChild(textBox);
  }
  //loading definition, translation and synonoym
  const defTextBox = document.getElementById('editDefTextArea')
  const transTextBox = document.getElementById('editTransTextArea')
  const synTextBox = document.getElementById('editSynTextArea')

  defTextBox.value = definitions[editedTW]
  transTextBox.value = translations[editedTW]
  synTextBox.value = synonyms[editedTW]


  //adjust the height to fit content
  const requiredHeight = senNumCurrSet * 50 + 600
  popup.style.height = requiredHeight + "px"

  //adjust the definition, translation and synonym textBoxes to fit the width
  defTextBox.style.width = textBoxWidth
  transTextBox.style.width = textBoxWidth
  synTextBox.style.width = textBoxWidth


}

function saveEdit() {
  const editedTW = document.getElementById('wordDropdown').value
  const Container = document.getElementById("editSenTextboxContainer");
  const textareas = Container.getElementsByTagName("textarea");
  for (let i = 0; i < textareas.length; i++) {
    const textarea = textareas[i];
    const textareaValue = textarea.value;
    exSenFinal[editedTW][i] = textareaValue;
  }
  const defTextBox = document.getElementById('editDefTextArea')
  const transTextBox = document.getElementById('editTransTextArea')
  const synTextBox = document.getElementById('editSynTextArea')

  definitions[editedTW] = defTextBox.value
  translations[editedTW] = transTextBox.value
  synonyms[editedTW] = synTextBox.value

  backupProgress();
  cancelEdit();
  refreshSen();
}

function cancelEdit() {
  removeAllElement("editSenTextboxContainer")
  const popup = document.getElementById('editSenPopup')
  popup.style.display = "none";
}

function showRemakePopup() {
  document.getElementById('reMakeSenPopup').style.display = 'block'
  const container = document.getElementById('reMake_exSenCon')
  removeAllElement('reMake_exSenCon')
  document.getElementById('userExampleSen').value = ""
  const TW = document.getElementById('wordDropdown').value
  const exSenSet = exSenFinal[TW]
  exSenSet.forEach(function(sentence) {
    const div = document.createElement('div')
    const checkBox = document.createElement('input')
    checkBox.type = 'checkbox'
    var text = document.createTextNode(sentence)
    div.appendChild(checkBox);
    div.appendChild(text);
    container.appendChild(div);
  })
}

function getCheckedSentences() {
  const container = document.getElementById('reMake_exSenCon');
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  const checkedSentences = [];

  checkboxes.forEach(function(checkbox) {
    if (checkbox.checked) {
      // Get the next sibling (TextNode) of the checkbox
      const sentence = checkbox.nextSibling.nodeValue;
      checkedSentences.push(sentence);
    }
  });

  return checkedSentences.join('\n');
}

async function reMakeSen() {
  if (generatingSen == true) {
    alert('還有例句在產生中，請等待例句產生完畢後再重新造句')
    return;
  }

  const remakeCheck = confirm("將替本單字重新造句，請確認是否繼續?")
  if (remakeCheck == 0) {
    return;
  }
  document.getElementById('reMakeSenPopup').style.display = 'none'
  var TWCopy = JSON.parse(JSON.stringify(targetWords))
  targetWords.length = 0
  queue.length = 0
  var selectElement = document.getElementById("wordDropdown");
  var selectedIndex = selectElement.selectedIndex
  var selectedOption = selectElement.options[selectedIndex];
  var currentTW = selectedOption.textContent;
  delete exSenFinal[currentTW];
  delete definitions[currentTW];
  delete translations[currentTW];
  targetWords.push(currentTW)
  console.log(targetWords)
  await makeSentence(true);
  targetWords = JSON.parse(JSON.stringify(TWCopy))
  selectElement.selectedIndex = selectedIndex
  whenDropChange();

}

function cancelRemakeSen() {
  document.getElementById('reMakeSenPopup').style.display = 'none'
}

async function makeSentence(isRemake) {
  if (generatingSen == true) {
    alert("例句已經產生中，請耐心等候");
    return;
  }
  updateQueueDisplay();
  senNumValue = senNum.value
  const apiKeyElement = document.getElementById("APIkey");
  const apiKey = apiKeyElement.value;

  if (!apiKey) {
    alert('請輸入正確的API金鑰.');
    return;
  } else if (queue.length == 0 && senNumValue <= exSenFinal[targetWords[0]].length) {
    alert('所有目標單字都已產生例句。')
    return;
  }
  console.log('makeSenClicked= ' + makeSenClicked)

  //check if there are existing example sentences
  if (makeSenClicked == 1) {

    var prevSenNum = 0;

    if (Object.keys(exSenFinal).length != 0) {
      for (const key in exSenFinal) {
        if (Array.isArray(exSenFinal[key])) {
          prevSenNum = exSenFinal[key].length;
          break;
        }
      }
    }

    if (senNumValue > prevSenNum) {
      queue = JSON.parse(JSON.stringify(targetWords));
      console.log("queue updated")
      console.log(queue)
    }
  }

  generatingSen = true;
  makeSenClicked = 1;




  //set sys/user/asst parameter
  const sysContent = "You are teaching English Vocabulary to adult learners.Assume that the learners are adults with life experience and understand adult topics, but their language abilities are equivalent to a 5-year-old. Please avoid complex or abstract words and concepts.";
  const userContent = "You are teaching English to adult learners with life experience and understand adult topics, but their language abilities are equivalent to a 5-year-old. \nDetermine the meaning of the target word, immeasurable, from this reference sentence: \" Happiness is immeasurable.\" Then, make 2 sentences to help your learners infer the meaning of the target word. Make sure the target word is used in the sentence. Afterwards, provide a translation and an easy definition to explain the meaning of the target word to your learners. Please make sure the words you use is easy enough for learners of 5-year-old equivalent English ability to understand"
  const astContent = "Sure. \n1. The team wins the game and they feel immeasurable joy. \n2. We do good things in immeasurable ways, such as helping others and spreading kindness.\nDefinition: the study of nature and how it works.\nTranslation: 無法衡量的\nSynoyms: 不可測量的"



  const temp = 0.1
  const promises = []; // create an array to hold the promises
  //Notify users sentences are being generated
  const progress = document.getElementById("progress")


  //for-loop to send the target words to chatGPT and retrieve data
  for (i = 0; i < queue.length; i++) {
    if (abort == 1) {

      break;
    }
    //Update the current progress
    progress.innerHTML = "例句產生中..." + i + "/" + queue.length;

    //initialize prompt
    const refSen = getSenInText(queue[i]);
    var prompt = ""
    if (isRemake == true) {
      //set sys/user/asst parameter for remaking sentence for a word
      /*const sysContent = "You are teaching English Vocabulary to adult learners.Assume that the learners are adults with life experience and understand adult topics, but their language abilities are equivalent to a 5-year-old. Please avoid complex or abstract words and concepts.";
      const userContent = "I saw a commercial that makes me want to buy the product. \nThe above sentence(s) doesn't reflect the target meaning of the target word, which is \"commercial\". Here is an example sentence that reflects the target meaning better. \"There are a lot of commercial activities in this area.\" Please make new sentences that reflect the target meaning to replace them and provide the correct definition for . "
      const astContent = "Sure. \n1. The team wins the game and they feel immeasurable joy. \n2. We do good things in immeasurable ways, such as helping others and spreading kindness.\nDefinition: the study of nature and how it works.\nTranslation: 無法衡量的\nSynoyms: 不可測量的"*/
      const checkedSentences = getCheckedSentences()
      const userExSen = document.getElementById('userExampleSen').value.trim()
      var userExSenPrompt = ""
      if (userExSen !== "")
        var userExSenPrompt = "Here is an example sentence that reflect the target meaning for your reference:\n" + userExSen

      prompt = responses[queue[i]] + "\nThe above is the previous response from you. The following sentences from above don't reflect the target meaning of the target word, which is \"" + queue[i] + "\". \n" + checkedSentences + "\n" + "\nPlease remake" + senNumValue + "sentences." + userExSenPrompt + "When remaking sentences, include common elements that are generally associated with the target word. Afterwards, just like in the previous response, provide a translation and list synonyms in Traditional Chinese and an easy definition in English to explain the meaning of the target word to said learners. Please make sure the words you use is easy enough for learners of 5-year-old equivalent English ability to understand."
    } else {
      prompt = "I am teaching English vocabulary to adult learners by asking them to infer meanings from example sentences. I need you to make the sentences for me. The example sentences should be as easy as possible to allow learners to infer from context. Therefore, when you are making sentences, except for the target vocabulary, use language that a 5-year-old native English speaker can understand. Don't worry if the target vocabulary I give you is not level appropriate. They have been previously screened, so just go ahead and do the following: \nDetermine the meaning of the target word, \"" + queue[i] + "\", from this reference sentence: \"" + refSen + ".\" Then, make " + senNumValue + " sentences to help the aforementioned learners infer the meaning of the target word. When making sentences, make sure the target word is used in each sentence without being replaced by synonyms and it share the same meaning in all sentences and the reference sentence. Don't add prefix or suffix to the target word when making sentences. For instance, when making a sentence with  the target word,\"sword\", don't make a sentence such as \" The fencer practiced her swordsmanship every day.\", where a suffix \"-manship\" is added to the target word, \"sword\". Also, include common elements that are generally associated with the target word. For instance, the target word, \"female\", is commonly associated with the ability to give birth to and take care of offsprings. The sentence made would then be: \"Female lion gives birth to baby lions.\" or \"A hen, or female chicken, sit on eggs to hatch them.\nAfterwards, provide a translation and list synonyms in Traditional Chinese and an easy definition in English to explain the meaning of the target word to said learners. Please make sure the words you use is easy enough for learners of 5-year-old equivalent English ability to understand";
    }

    //send prompt
    try {
      const result = await sendPrompt(prompt, sysContent, userContent, astContent, temp);

      console.log(queue[i] + " sent");
      console.log(result)

      //retrieve and remove definition from the result array
      responses[queue[i]] = result
      definitions[queue[i]] = getDefinition(result)
      translations[queue[i]] = getTranslation(result)
      synonyms[queue[i]] = getSynonym(result)
      resultTrimmed = trimResult(result)

      //assign each example sentence to an array as one element inside
      let senArray = resultTrimmed.split(/\n\d+\.\s/);
      senArray.shift();
      exSenFinal[queue[i]] = senArray
      backupProgress();

      //push an option to the dropdown list
      const option = document.createElement('option');
      option.setAttribute("value", queue[i]);
      option.text = queue[i];
      const wordDropdown = document.getElementById("wordDropdown");

      // Check if the option already exists
      let optionExists = false;
      for (let j = 0; j < wordDropdown.options.length; j++) {
        if (wordDropdown.options[j].value === option.value && wordDropdown.options[j].text === option.text) {
          optionExists = true;
          break;
        }
      }

      // Append the option if it doesn't exist
      if (!optionExists) {
        wordDropdown.appendChild(option);
      }

      if (i == 0) {
        setupTab2ResultDisplay()
        curSenSet = 1;
        wordDropdown.selectedIndex = curSenSet - 1;
        refreshSen();
        loadGuessAnswer();
        document.getElementById("guessContainer").style.display = "grid";
        makeButtonRegular('makeSentenceButton');
        makeButtonDominant('prevVocButton');
        makeButtonDominant('nextVocButton')
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 429) {
        removeIncompleteExSenSets();
        addToQueue(targetWords, exSenFinal, queue);
        let countdown = 5; // Countdown duration in seconds

        const countdownInterval = setInterval(() => {
          countdown--;
          progress.innerHTML = `ChatGPT未回應，(等待 ${countdown} 秒後重新嘗試)`;

          if (countdown === 0) {
            clearInterval(countdownInterval);
            i--; // Decrement the loop counter to retry the same target word
          }
        }, 1000);


        continue; // Skip the remaining code in the loop and move to the next iteration
      } else {
        alert("例句產生錯誤，請再次點選產生例句。");
        removeIncompleteExSenSets();
        addToQueue(targetWords, exSenFinal, queue);
        progress.innerHTML = "例句產生錯誤，請再次點選產生例句。";
        generatingSen = false;
        return; // Stop execution for other errors
      }
    }
    //Delay specific amount of time before going into the next for loop
    setTimeout(function() {
    }, sendPromptDelay);


  }


  // Adding previously finished target words as options 
  //const wordDropdown = document.getElementById("wordDropdown");
  console.log(exSenFinal);

  for (var key in exSenFinal) {
    if (exSenFinal.hasOwnProperty(key)) {
      // Check if the value is undefined
      if (typeof exSenFinal[key] === 'undefined') {
        delete exSenFinal[key]; // Remove the key-value pair if the value is undefined
        continue; // Skip further processing for this key
      }

      // Check if an option with the same value already exists
      if (Array.from(wordDropdown.options).some(option => option.value == key)) {
        continue; // Skip adding the option if it already exists
      }

      var option = document.createElement('option');
      option.setAttribute("value", key);
      option.text = key;
      wordDropdown.appendChild(option);
    }
  }

  initializeBlankNum();
  document.getElementById("queueDisplay").innerHTML = "";
  queue.length = 0;
  makeSenClicked = 1;
  generatingSen = false;

  if (abort == 1) {
    // Notify users the generation has been aborted
    progress.innerHTML = "產生例句被使用者中止。"
    abort = 0;
  } else {
    // Notify users the generation has completed
    progress.innerHTML = "例句已產生完畢。";
  }

}

function getDefinition(str) {
  const easyRegex = /easy definition:(.*)/i;
  const definitionRegex = /definition:(.*)/i;

  const easyMatch = str.match(easyRegex);
  const definitionMatch = str.match(definitionRegex);

  if (easyMatch && easyMatch.length > 1) {
    return easyMatch[1].trim();
  }

  if (definitionMatch && definitionMatch.length > 1) {
    return definitionMatch[1].trim();
  }

  return '';
}


function getTranslation(str) {
  const regex = /translation:(.*)/i;
  const match = str.match(regex);
  if (match && match.length > 1) {
    return match[1].trim();
  }
  return '';
}

function getSynonym(str) {
  const regex = /synonyms:(.*)/i;
  const match = str.match(regex);
  if (match && match.length > 1) {
    return match[1].trim();
  }
  return '';
}

function showDef() {
  if (defShown[curSenSet - 1] == 1) {
    hideDef();
    defShown[curSenSet - 1] = 0;
  } else {
    var defText = document.getElementById("defText")
    var currentWord = document.getElementById("wordDropdown").value
    defText.innerHTML = definitions[currentWord]
    defShown[curSenSet - 1] = 1;
  }
}

function showTrans() {
  if (translShown[curSenSet - 1] == 1) {
    hideTrans();
    translShown[curSenSet - 1] = 0;
  } else {
    var currentWord = document.getElementById("wordDropdown").value;
    var transText = document.getElementById("translText")
    transText.innerHTML = translations[currentWord]
    transText.style.display = "inline-block"
    translShown[curSenSet - 1] = 1;

  }
}
function hideTrans() {
  var defText = document.getElementById("translText")
  translText.innerHTML = ""
}

function hideDef() {
  var defText = document.getElementById("defText")
  defText.innerHTML = ""
}

function whenDropChange() {
  var selectElement = document.getElementById("wordDropdown");
  curSenSet = selectElement.selectedIndex + 1;
  console.log(curSenSet)
  refreshSen()
  updateDef()
  updateTransl()
  loadGuessAnswer()


}

function refreshSen() {
  removeAllElement("senContainer")
  displaySen()



}

function nextVoc() {
  const numWordDropdown = document.getElementById("wordDropdown").options.length;
  console.log("numWordDropdown: " + numWordDropdown)
  var defText = document.getElementById("defText");
  const translText = document.getElementById("translText");
  const wordDropdown = document.getElementById("wordDropdown");


  var alertMessage = "";
  if (generatingSen) {
    alertMessage = "該單字之例句仍在產生中，請稍等。"
  } else {
    alertMessage = "此為最後一個目標單字，請點選下一步，以開始閱讀練習。"
  }

  if (curSenSet == numWordDropdown) {
    alert(alertMessage);
    if (generatingSen == false) {
      const button = document.getElementById("tab2NextButton");
      button.style.display = "inline-block"
      button.style.alignSelf = "right"
      button.addEventListener('click', function() {
        document.getElementById('tabButtonStep3').click();
      });
      makeButtonRegular('prevVocButton');
      makeButtonRegular('nextVocButton');
      window.scrollTo(0, document.body.scrollHeight);
    }

  } else {
    curSenSet = curSenSet + 1;
    console.log("curSenSet:" + curSenSet)
    //console.log(curSenSet)
    wordDropdown.selectedIndex = curSenSet - 1;
    refreshSen()

    //check if definition is showned
    //console.log(defShown[curSenSet - 1])
    //console.log(defShown)
    updateDef()
    updateTransl()


  }
}

function prevVoc() {
  const defText = document.getElementById("defText");
  const translText = document.getElementById("translText");
  const wordDropdown = document.getElementById("wordDropdown");



  if (curSenSet <= 1) {
    alert("此為第一個目標單字")
  } else {
    curSenSet = curSenSet - 1;
    //console.log(curSenSet)
    wordDropdown.selectedIndex = curSenSet - 1;
    refreshSen()
    //check if definition is showned
    //console.log(defShown[curSenSet - 1])
    //console.log(defShown)
    updateDef()
    updateTransl()
  }
}

function updateDef() {
  currentWord = wordDropdown.value
  if (defShown[curSenSet - 1] == 0 || typeof defShown[curSenSet - 1] === 'undefined') {
    hideDef()
    //console.log("definition hidden")
  } else {
    defText.innerHTML = definitions[currentWord]
    //console.log("definition updated")
  }
}

function updateTransl() {
  currentWord = wordDropdown.value
  if (translShown[curSenSet - 1] == 0 || typeof translShown[curSenSet - 1] === 'undefined') {
    hideTrans()
    //console.log("definition hidden")
  } else {
    translText.innerHTML = translations[currentWord]
    translText.style.display = "inline-block"
    //console.log("definition updated")
  }
  loadGuessAnswer()
  document.getElementById("ZhGuess").value = ""
  updateMeter()
}

function highlightTargetWords(str, target) {
  let targetArray = Array.isArray(target) ? target : [target];
  const regex = new RegExp(`\\b(${targetArray.join('|')})(s|es|ed)?\\b`, 'gi');
  return str.replace(regex, '<mark>$&</mark>');
}

function displaySen() {
  showPopup
  const twToFind = document.getElementById("wordDropdown").value
  console.log("twToFind:", twToFind)
  const exSen = exSenFinal[twToFind];
  const senContainer = document.getElementById("senContainer")
  //display example sentences
  let senIteration;
  for (senIteration = 0; senIteration < exSen.length; senIteration++) {
    const twToShow = findClosestMatch(exSen[senIteration], twToFind).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    console.log(twToShow)
    const highlighted = highlightTargetWords(exSen[senIteration], twToShow)
    console.log(highlighted)
    var sen = document.createElement('p');
    // Set the innerHTML of the paragraph element
    sen.innerHTML = highlighted;
    sen.style.fontSize = "large";
    //console.log("sen= " + sen.innerHTML)
    // Append the paragraph element to the body of the HTML document
    senContainer.appendChild(sen);
  }
  const paragraph = senContainer.querySelector("p");
  paragraph.style.textAlign = "left";
}

// Function to create a span element
function createSpan(word, container) {
  var span = document.createElement("span");
  span.innerHTML = word + " ";
  span.style.fontSize = "large"

  if (targetWords.includes(word)) {
    span.classList.add("highlight");
    span.addEventListener("click", function() {
      showPopup(word, span);
    });
  }

  container.appendChild(span);
}

function loadGuessAnswer() {
  var currentWord = document.getElementById("wordDropdown").value;
  const string = translations[currentWord] + "," + synonyms[currentWord]

  GuessAnswer.length = 0
  GuessAnswer = string.split(/[、，,;]/).map(item => item.trim())
  console.log(GuessAnswer)
  return string
}

function updateMeter() {
  var input = document.getElementById("ZhGuess").value;
  // Calculate the closeness of the input value to the target value

  var closeness = calculateCloseness(input, GuessAnswer);
  console.log(closeness)

  // Update the meter value
  var meter = document.getElementById("closeness");
  meter.value = closeness;
}

function calculateCloseness(input, target) {


  var matchesResult = [];
  for (var targetItem = 0; targetItem < target.length; targetItem++) {
    var matches = 0;
    for (var inputcharacter = 0; inputcharacter < input.length; inputcharacter++) {

      if (target[targetItem].includes(input[inputcharacter])) {
        matches = matches + 1;
      }
    }
    matchesResult[targetItem] = Math.ceil((matches / target[targetItem].length) * 10)
  }
  return Math.max(...matchesResult);


  /*
    for (var i = 0; i < input.length; i++) {
      if (target.includes(input[i])) {
        matches++;
      }
    }*/

  // Return a value between 1 and 10 based on the number of matches
  //return Math.ceil((matches / target.length) * 10);
}


//============================= Tab3 =========================================


// Function to create a popup element

// Function to show the popup with example sentences
function showPopup(word, targetElement) {
  var popup = document.getElementById("popup");
  popup.innerHTML = "";

  var sentences = exSenFinal[word];

  if (sentences) {
    sentences.forEach(function(sentence) {
      var p = document.createElement("p");
      p.innerHTML = sentence;
      popup.appendChild(p);
    });
  } else {
    var p = document.createElement("p");
    p.innerHTML = "此單字尚未產生例句，若要產生例句，請回步驟2。";
    popup.appendChild(p);
  }

  // Position the popup right below the target word
  var rect = targetElement.getBoundingClientRect();
  popup.style.width = 0.8 * window.innerWidth + "px"
  popup.style.left = 0.1 * window.innerWidth + "px";
  popup.style.top = rect.bottom + "px";

  popup.style.display = "block";

  // Hide the popup when clicking outside of it
  document.addEventListener("click", function(event) {
    var isClickInsidePopup = popup.contains(event.target);
    var isClickOnHighlightedWord = event.target.classList.contains("highlight");

    if (!isClickInsidePopup && !isClickOnHighlightedWord) {
      popup.style.display = "none";
    }
  });
}

// Function to display the text with highlighted target words
function displayText(text, containerId) {
  var container = document.getElementById(containerId);
  container.innerHTML = "";

  var words = text

  words.forEach(function(word) {
    createSpan(word, container);
  });
}

function startReading() {
  makeButtonRegular('startReadingButton')
  makeButtonDominant('tab3to4Button')
  const tab = document.getElementById("Tab3");
  button = document.getElementById('tab3to4Button');
  button.style.display = "inline-block"
  button.addEventListener('click', function() {
    document.getElementById("tabButtonStep4").click()
  });
  displayText(textStudied, 'textHolder')
  window.scrollTo(0, document.body.scrollHeight);
}

//============================= Tab4 =========================================

function initializeBlankNum() {
  removeIncompleteExSenSets();
  selectElement = document.getElementById("blankNum")
  removeAllOptions("blankNum")
  let minLength = Infinity;

  for (const key in exSenFinal) {
    if (Array.isArray(exSenFinal[key])) {
      const arrayLength = exSenFinal[key].length;
      console.log("arrayLength:" + arrayLength)
      minLength = Math.min(minLength, arrayLength);

    }
  }
  genNumOpt(selectElement, 1, minLength)
  selectElement.selectedIndex = 0
}

function selectAllCheckboxes(checked) {
  const TWtableContainer = document.getElementById("TWtableContainer")
  var checkboxes = TWtableContainer.querySelectorAll('input[type="checkbox"]');
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = checked;
  }
}

function applyChanges() {
  selectedBlankTW.length = 0;
  const TWtableContainer = document.getElementById("TWtableContainer")
  var checkboxes = TWtableContainer.querySelectorAll('input[type="checkbox"]');
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      selectedBlankTW.push(checkboxes[i].parentNode.nextSibling.innerHTML);
    }
  }
  console.log(selectedBlankTW); // You can do whatever you want with the selected target words array
  alert("練習單字已更新。")
  customizeRange = 1;
  document.getElementById("TWtableButtonContainer").style.display = "none";
  document.getElementById("TWtableContainer").style.display = "none";
  document.getElementById("TWrange").style.display = "block";
  document.getElementById("blankOptionsContainer").style.display = "grid";


}

function cancelChanges() {
  document.getElementById("TWtableButtonContainer").style.display = "none";
  document.getElementById("TWrange").style.display = "block";
  document.getElementById("TWtableContainer").style.display = "none";
  document.getElementById("blankOptionsContainer").style.display = "grid";
}

function createTable() {
  // Clear existing table
  document.getElementById("TWtableButtonContainer").style.display = "block";
  document.getElementById("TWtableContainer").style.display = "block";
  document.getElementById("TWrange").style.display = "none";
  document.getElementById("blankOptionsContainer").style.display = "none";
  const TWtableContainer = document.getElementById("TWtableContainer")
  removeAllElement("TWtableContainer");

  var table = document.createElement('table');
  table.id = 'targetTable';
  var thead = document.createElement('thead');
  var tbody = document.createElement('tbody');
  var headerRow = document.createElement('tr');

  // Create table headers

  // Generate table rows for target words
  for (var i = 0; i < targetWords.length; i++) {
    var row = document.createElement('tr');
    var checkboxCell = document.createElement('td');
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = false; // Checkboxes checked by default
    checkboxCell.appendChild(checkbox);
    row.appendChild(checkboxCell);

    var wordCell = document.createElement('td');
    wordCell.innerHTML = targetWords[i];
    row.appendChild(wordCell);

    tbody.appendChild(row);
  }
  table.appendChild(tbody);

  TWtableContainer.appendChild(table);
}

function makeBlank() {
  //reset any previous blanks made/buttons shown
  document.getElementById("reTryButton").style.display = "none";
  document.getElementById("nextRound").style.display = "none";
  removeAllElement("blankContainer");
  Object.keys(blankAnswerKey).forEach((key) => {
    delete blankAnswerKey[key];
  });
  answerList.length = 0;
  const blankNum = document.getElementById("blankNum").value;
  const exSenBlanked = JSON.parse(JSON.stringify(exSenFinal));
  blankAnswerKey = JSON.parse(JSON.stringify(replaceTW(targetWords, exSenBlanked)));
  console.log(blankAnswerKey)
  let questionIndex
  if (customizeRange == 1) {
    questionIndex = shuffleArray(JSON.parse(JSON.stringify(selectedBlankTW)))
  } else {
    questionIndex = shuffleArray(JSON.parse(JSON.stringify(targetWords)))
  }
  for (j = 0; j < questionIndex.length; j++) {
    const blankContainer = document.getElementById("blankContainer");
    const Qcontainer = document.createElement('div')
    Qcontainer.className = "grid-container";
    Qcontainer.style.display = "flex";
    Qcontainer.style.flexDirection = "row";
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.style.width = "30%";
    input.style.margin = "10px";
    //blankId = `blank${10 * i + j}!`;
    //input.setAttribute("id", blankId);
    const blankedSen = document.createElement("p")
    blankedSen.style.textAlign = "left";
    blankedSen.style.width = "65%";
    blankedSen.innerHTML = exSenBlanked[questionIndex[j]][blankNum - 1];
    answerList[j] = blankAnswerKey[questionIndex[j]][blankNum - 1];
    Qcontainer.appendChild(input);
    Qcontainer.appendChild(blankedSen);
    blankContainer.appendChild(Qcontainer);
  }
  document.getElementById("checkAnswer").style.display = "inline-block"

}

function checkAnswer() {
  const blankContainer = document.getElementById("blankContainer");
  const inputElements = blankContainer.querySelectorAll("#blankContainer input[type='text']");
  const userResponses = []; // Array to store user responses

  // Iterate over the input elements and perform the desired operations
  var correctRecord = []
  inputElements.forEach(function(input, index) {
    const inputValue = input.value.trim();
    userResponses.push(inputValue); // Store user response in the array

    const answer = answerList[index]; // Get the corresponding answer from the answerList array

    if (inputValue !== answer) {
      input.style.backgroundColor = "yellow"; // Highlight input if the response is incorrect

      const answerDisplay = document.createElement("span");
      answerDisplay.style.color = "red";
      answerDisplay.textContent = " (正確答案: " + answer + ")";

      const parentDiv = input.parentNode; // Get the parent div
      const newDiv = document.createElement("div"); // Create new div
      newDiv.appendChild(answerDisplay); // Append answerDisplay to the new div
      newDiv.setAttribute("data-correct", "")

      // Add a custom attribute to the parent div to indicate incorrect answer
      parentDiv.setAttribute("data-incorrect", "");

      // Insert the new div right after the parent div
      parentDiv.parentNode.insertBefore(newDiv, parentDiv.nextSibling);
    } else {
      input.style.backgroundColor = "#5de047";

      // Add a custom attribute to the parent div to indicate correct answer
      const parentDiv = input.parentNode; // Get the parent div
      parentDiv.setAttribute("data-correct", "");
      correctRecord[index] = 1;
      console.log("index= " + index)
      console.log(correctRecord)

    }
    document.getElementById("checkAnswer").style.display = "none"
  });
  // Remove the matched answer from the answerList
  for (let k = correctRecord.length - 1; k >= 0; k--) {
    if (correctRecord[k] === 1) {
      answerList.splice(k, 1);
      correctRecord.splice(k, 1);
    }
  }
  if (answerList.length > 0) {
    document.getElementById("reTryButton").style.display = "inline-block"
  } else {
    document.getElementById("nextRound").style.display = "inline-block"
    document.getElementById("reTryButton").style.display = "none"
  }
}

function nextRound() {
  // Assuming you have a select element with id "mySelect"
  const selectElement = document.getElementById("blankNum");

  // Get the current selected index
  const currentIndex = selectElement.selectedIndex;

  // Calculate the index of the next option
  const nextIndex = currentIndex + 1;

  // Check if the next option exists
  if (nextIndex < selectElement.options.length) {
    // Select the next option
    selectElement.selectedIndex = nextIndex;
    document.getElementById("startPractice").click()
  } else {
    alert("恭喜你! 你已經完成所有拼字練習")
    document.getElementById("nextRound").style.display = "none"

  }

}

function retryPractice() {
  const blankContainer = document.getElementById("blankContainer");
  const correctDivs = blankContainer.querySelectorAll("[data-correct]");

  correctDivs.forEach(function(div) {
    div.remove();
  });

  const inputElements = blankContainer.querySelectorAll("#blankContainer input[type='text']");
  inputElements.forEach(function(input) {
    input.value = "";
  }
  );
  document.getElementById("checkAnswer").style.display = "inline-block"
  document.getElementById("reTryButton").style.display = "none"
}

function findClosestMatch(sentence, targetWord) {
  // Split the sentence into an array of words
  const words = sentence.split(/[\s.,\/#!$%\^&\*;:{}=\-_`~()]+/);

  let closestMatch = null;
  let smallestDistance = Infinity;
  var toCheckDistance = []
  // Iterate over each word in the sentence
  words.forEach(word => {
    //filter out words that are shorter than the target words
    if (word.length >= (targetWord.length - 3)) {
      toCheckDistance.push(word)
    }

  });

  toCheckDistance.forEach(word => {
    // Calculate the Levenshtein distance between the lowercase word and the lowercase target word
    const distance = levenshteinDistance(word.toLowerCase(), targetWord.toLowerCase());

    // Update the closest match if the current word has a smaller distance
    if (distance < smallestDistance) {
      closestMatch = word;
      smallestDistance = distance;
    }
  })


  return closestMatch;
}


// Function to calculate the Levenshtein distance between two strings
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // Initialize the matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Calculate the Levenshtein distance
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function replaceTW(twArray, senObj) {
  var obj = senObj;
  var answerKey = {};

  // Function to replace the middle part of a word while keeping the first and last letter
  function replaceMiddlePart(word) {
    if (word.length <= 2) {
      return word; // No middle part to replace
    }
    var firstLetter = word.charAt(0);
    var lastLetter = word.charAt(word.length - 1);
    var replacedMiddlePart = "___"
    return firstLetter + replacedMiddlePart + lastLetter;
  }

  for (i = 0; i < twArray.length; i++) {
    if (senObj[twArray[i]]) {
      for (j = 0; j < senObj[twArray[i]].length; j++) {
        var senArray = senObj[twArray[i]];
        console.log("senArray = " + senArray);
        senToReplace = senArray[j];

        // Find the closest match of the target word in the sentence
        var closestMatch = findClosestMatch(senToReplace, twArray[i]);

        // Ensure the array exists before trying to set a property on it
        if (!answerKey[twArray[i]]) {
          answerKey[twArray[i]] = [];
        }
        answerKey[twArray[i]][j] = closestMatch;

        // Check if the checkbox is checked
        var checkbox = document.getElementById("replaceMiddlePartCheckbox");
        if (checkbox.checked) {
          // Replace the middle part of the closest match with underscores
          replacedSen = senToReplace.replace(new RegExp(closestMatch, "gi"), replaceMiddlePart(closestMatch));
        } else {
          // Replace the entire closest match with underscores
          replacedSen = senToReplace.replace(new RegExp(closestMatch, "gi"), "____");
        }

        obj[twArray[i]][j] = replacedSen;
      }
    } else {
      alert('單字: ' + twArray[i] + '尚未產生例句，該單字將不會產生填空題，請回到步驟2，並點選產生例句，待例句產生完畢後，再次點選開始練習。')
    }
  }
  return answerKey;
}

function makeButtonRegular(id) {
  var element = document.getElementById(id);
  element.classList.remove('dominantButton');
  element.classList.add('regularButton');
}

function makeButtonDominant(id) {
  var element = document.getElementById(id);
  element.classList.remove('regularButton');
  element.classList.add('dominantButton');
}

//============================= StudySet Manager =========================================
function tableLocalStorageFiles() {
  var fileTable = document.getElementById("fileTable");
  var files = Object.keys(localStorage);

  while (fileTable.rows.length > 1) {
    fileTable.deleteRow(1);
  }

  for (var i = 0; i < files.length; i++) {
    var row = fileTable.insertRow(i + 1);
    var selectCell = row.insertCell(0);
    var fileNameCell = row.insertCell(1);

    fileNameCell.innerHTML = files[i];
    selectCell.innerHTML = '<input type="checkbox" name="fileCheckbox" value="' + files[i] + '">';
  }
}


function deleteSelectedFiles() {
  var checkboxes = document.getElementsByName("fileCheckbox");
  var selectedFiles = [];

  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      selectedFiles.push(checkboxes[i].value);
    }
  }

  for (var i = 0; i < selectedFiles.length; i++) {
    localStorage.removeItem(selectedFiles[i]);
  }

  // Clear the table and re-list the files
  var fileTable = document.getElementById("fileTable");
  fileTable.innerHTML = '<tr><th>選取</th><th>學習集名稱</th></tr>';
  tableLocalStorageFiles();
}
//============================= All Tabs =========================================
async function sendPrompt(prompt, sysContent, userContent, astContent, temperature) {
  const apiKeyElement = document.getElementById("APIkey");
  const apiKey = apiKeyElement.value;
  const progress = document.getElementById('progress');

  if (!apiKey) {
    alert('請輸入正確的API金鑰.');
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-1106',
        messages: [
          { role: 'system', content: sysContent },
          { role: 'user', content: userContent },
          { role: 'assistant', content: astContent },
          { role: 'user', content: prompt },
        ],
        temperature: temperature,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = new Error('Error: ' + response.status + ' ' + response.statusText);
      throw error;
    }

    const json = await response.json();
    const result = json.choices[0].message.content;
    return result;
  } catch (error) {
    throw error;
  }
}

function removeIncompleteExSenSets() {
  senNumValue = Number(document.getElementById('senNum').value)
  let minLength = Infinity;
  let maxLength = 0;

  // Find the minimum and maximum lengths
  // Iterate over the keys of exSenFinal
  for (const key in exSenFinal) {
    const arrayLength = exSenFinal[key].length;
    minLength = Math.min(minLength, arrayLength);
    maxLength = Math.max(maxLength, arrayLength);
  }
  console.log("minLength=" + minLength)
  console.log("senNumValue=" + senNumValue)
  console.log(minLength !== senNumValue)
  // Check if minimum length is not equal to senNumValue
  if (minLength !== senNumValue) {
    // Remove keys with arrays lengths not equal to the maximum length
    var removed = ""
    for (const key in exSenFinal) {
      if (exSenFinal[key].length !== maxLength) {
        delete exSenFinal[key];
        removed += (key + ", ")
      }
    }
    document.getElementById('tabButtonStep2').click();
    makeButtonDominant('makeSentenceButton');
    makeButtonRegular('prevVocButton')
    makeButtonRegular('nextVocButton')
    alert('因為例句不完整，已經移除 ' + removed + " 請再次點選產生例句以完成步驟2。")

  }

}

function removeAllElement(Id) {
  var container = document.getElementById(Id);

  if (container) {
    var elements = container.querySelectorAll("*");

    elements.forEach(function(element) {
      element.remove();
    });
  } else {
    console.log("element with specified container Id not found.")
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function printStudySet() {
  hideElement('tabButtons');
  hideElement('Tab6');
  var button = document.createElement('button');
  button.textContent = '返回';
  button.id = "returnButton"
  button.onclick = returnFromPrint;
  var container = document.createElement('div');
  container.appendChild(button);
  container.id = "printContent"
  document.body.appendChild(container);


  for (var key in exSenFinal) {
    var voc = document.createElement('div')
    voc.id = key
    container.appendChild(voc)
    var h3 = document.createElement('h3')
    h3.innerHTML = key
    voc.appendChild(h3);
    exSenFinal[key].forEach(function(element, index) {
      var p = document.createElement('p')
      p.innerHTML = (index + 1) + ". " + element
      pID = key + index
      p.id = pID
      voc.appendChild(p);
      highlightTargetString(pID, key)
    })

    var def = document.createElement('p');
    def.innerHTML = "定義: " + definitions[key];
    voc.appendChild(def);

    var trans = document.createElement('p');
    trans.innerHTML = "翻譯: " + translations[key];
    voc.appendChild(trans);

    voc.appendChild(document.createElement('hr'))
  }
  window.print();

}
function hideElement(elementId) {
  // Add a CSS style to hide all elements
  var element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }

}

function unHideElement(elementId) {
  // Add a CSS style to hide all elements
  var element = document.getElementById(elementId);
  if (element) {
    element.style.display = '';
  }

}

function returnFromPrint() {
  // Remove the CSS style that hides all elements
  unHideElement('tabButtons');
  document.getElementById('tabButtonStep5').click();
  document.getElementById('returnButton').remove();
  document.getElementById('printContent').remove();
}

function highlightTargetString(elementId, targetString) {
  var divElement = document.getElementById(elementId);
  if (divElement) {
    var content = divElement.textContent || divElement.innerText;
    var words = content.trim().split(/\s+/);

    var closestMatch = '';
    var minDistance = Infinity;

    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      var distance = levenshteinDistance(word, targetString);

      if (distance < minDistance) {
        minDistance = distance;
        closestMatch = word;
      }
    }

    if (closestMatch !== '') {
      var regex = new RegExp(closestMatch, 'gi');
      var highlightedContent = content.replace(regex, '<u><b>$&</b></u>');
      divElement.innerHTML = highlightedContent;
    }
  }
}

