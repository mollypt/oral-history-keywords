
const topics = []
const topic_prev = []
const col = document.querySelector(".column-container")
const co = [];
const segments = []
let metadata = {}
let selectedTopic = null;
let interviewIndex = 0
const textPage = document.querySelector(".segment-page").cloneNode(true)
const topicsPage = document.querySelector(".topics-container").cloneNode(true)
document.querySelector(".segment-page").remove()

function pluralPair(a, b) {
  return (a + 's' == b || a == b + 's')
}

function verbPair(a,b) {
  return (a + 'ed' == b || a == b + 'ed')
}

function reset() {
  selectedTopic = null
  document.querySelectorAll(`.keyword`).forEach(div => div.classList.remove("on"))
  document.querySelectorAll(`.keyword`).forEach(div => div.classList.remove("off"))
  document.querySelectorAll(`.keyword`).forEach(div => div.classList.remove("adj"))
  document.querySelectorAll(`.keyword`).forEach(div => div.classList.remove("pair"))
  document.querySelectorAll(`.keyword`).forEach(div => div.classList.add("static"))
  // document.querySelector(".banner").classList.remove("active"); 
  // document.querySelector(".banner").classList.remove("secondary"); 
}

function scrollToDiv() {
  const element = document.querySelector(".text-block");
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener('mouseleave', () => {
    document.querySelectorAll(`.keyword`).forEach(div => {
    div.classList.remove("static-off") 
    // if (!selectedTopic) { document.querySelector(".banner").textContent = ""; }
  
  })
});

function updateInterview(docs,event) {
  const numDocs = docs.length;
  const button = document.querySelector(".next-button");
  if (interviewIndex==numDocs-1) {
    interviewIndex = 0
  }
  button.textContent = `<  ${interviewIndex+1} of ${numDocs}  >`;
  document.querySelector(".text-block").replaceChildren();
  const file = docs[interviewIndex]
  interviewIndex +=1
  let interviewID = file.split("/")[2].split('.txt')[0]
  interviewID = interviewID.substring(0, interviewID.lastIndexOf("-"))

  const interviewInfo = metadata[interviewID]
  const narrator = interviewInfo?.Narrator ?? null;
  if (!narrator) { 
    updateInterview(docs)
    return
  }
  document.querySelector(".narrator").textContent = narrator;
  const interviewer = metadata[interviewID]["Interviewer"].replace(",", " and ")
  document.querySelector(".interviewer").textContent = 
    `Interviewed by ${interviewer} on ${metadata[interviewID]["Date"]}`;

    d3.text(file).then(text => {
    const speech = document.createElement("p");
    speech.textContent = text.replace(/\<.*?\>/g, "");
    document.querySelector(".text-block").appendChild(speech)
  }).catch(error => {
    console.error("Could not load data:", error);
    updateInterview(docs)
    // Add a message to the UI to let the user know something went wrong
  });
}

function drawConnections(a, b) {
  console.log('drawing connections')
  interviewIndex = 0 
  const docs = []
  Object.keys(segments).forEach(f => {
    const prevs = segments[f]
    if (prevs[a] > .12 && prevs[b] > .12) {
      docs.push(f)
    }
  })
  document.querySelector(".text-block").replaceChildren();
  // document.querySelector(".next-button").removeEventListener();''
  document.querySelector(".next-button").addEventListener("click", (event) => { updateInterview(docs, event) })
  updateInterview(docs)
}

function clickFnc(event, i) {
  if (selectedTopic) {
    if (document.querySelector(`.topic_${i}`).classList.contains('adj')) {
      document.body.appendChild(textPage)
      drawConnections(selectedTopic.split("_")[1], i)
      document.querySelector(".topic-title1").textContent = topics[selectedTopic.split("_")[1]].replace(" ", "\n")
      document.querySelector(".topic-title2").textContent = topics[i].replace(" ", "\n")
      scrollToDiv()
      setTimeout(resolve, 500); 
      document.querySelector(".topics-container").remove();
    }
    reset()
    return
  } else {
    selectedTopic = `.topic_${i}`
    const toOff = [...document.querySelectorAll(`.keyword`)].filter(div => {
    return !div.classList.contains(`topic_${i}`)
  })
  toOff.forEach(div => div.classList.add("off") )
  document.querySelectorAll(`.topic_${i}`).forEach(div => div.classList.add("on"))
  const adjTopics = co[i];
  adjTopics.forEach(i => {
    const topicDivs = document.querySelectorAll(`.topic_${i}`)
    topicDivs.forEach(div => div.classList.add("adj"))
  })
  // document.querySelector(".banner").classList.add("active"); 
}
}

function mouseoutFnc(event, i, topic) {
  if (selectedTopic) { 
    // document.querySelector(".banner").classList.remove('secondary');
    // document.querySelector(".banner").textContent = topics[selectedTopic.split("_")[1]]; 
    document.querySelectorAll(selectedTopic).forEach(div => div.classList.remove("pair"))
    document.querySelectorAll(`.topic_${i}`).forEach(div => div.classList.remove("pair"))
    document.querySelectorAll(`.adj`).forEach(div => div.classList.remove("hidden"))

    return 
  }
  const topicDivs = document.querySelectorAll(`.topic_${i}`)
  topicDivs.forEach(div => div.classList.remove("on"))
}

function mouseoverFnc(event, i, topic) {
  console.log('mouseover: ', i, topic)
    if (selectedTopic && document.querySelector(`.topic_${i}`).classList.contains('adj')) {
      // document.querySelector(".banner").textContent = topics[i] 
      // document.querySelector(".banner").classList.add('secondary')
      document.querySelectorAll(".adj").forEach(div=> {
        console.log("div, topic: ", div, topic, selectedTopic)
        if (!div.classList.contains(selectedTopic) && !div.classList.contains(`topic_${i}`)) {
          div.classList.add("hidden")} 
        })
      document.querySelectorAll(`.topic_${i}`).forEach(div=> {
        div.classList.add("pair")} )
      document.querySelectorAll(selectedTopic).forEach(div=> {
        div.classList.add("pair")} )
      return
    }
    const topicDivs = document.querySelectorAll(`.topic_${i}`)
    topicDivs.forEach(div => div.classList.add("on"))
    console.log('topicDivs: ', topicDivs)
    document.querySelectorAll(`.keyword`).forEach(div => {
      div.classList.add("static-off")
    // if (!selectedTopic) {  document.querySelector(".banner").textContent = topics[i] }
})
}

d3.text("topics.tsv").then(data => {
  const lines = data.split('\n');
  lines.forEach(line => {
    topics.push(line.split("\t")[2])
    topic_prev.push(line.split("\t")[1])
  })

  d3.text("cooccur.txt").then(cooccurData => {
    const cooccur_lists = cooccurData.split('\n');
    cooccur_lists.forEach((line, topic_number) => {
      const topic_list = line.split(" ")
      co[topic_number] = topic_list
    })

    d3.text("all_segments_MALLET/doc-topics.tsv").then(docTopicData => {
      const docTopics = docTopicData.split('\n')
      docTopics.forEach(row => {
        segments[row.split("\t", 2)[1]] = row.split("\t").splice(2)
      })
    })

    d3.csv("interview_metadata.csv").then(meta => {
      meta.forEach(row=>{
        const fname = row["Filename"].split("-transcript")[0].split(".txt")[0]
        metadata[fname] = row;
      })
    })
  const keywords = {}
  topics.forEach((topic, i) => {
    if (topic_prev[i] > .015) {
    topic.split(" ").slice(0, 8).forEach(keyword => {
      keywords[keyword] = i
    })
  }})

  const sortedKeywords = new Set(Object.keys(keywords).sort((a, b) => a.localeCompare(b)));
  console.log('sorted keywords: ', sortedKeywords)
  sortedKeywords.forEach(keyword => {
      
        const entryDiv = document.createElement("div");
        entryDiv.textContent =  keyword.toLowerCase();
        entryDiv.id = keyword;
        entryDiv.classList.add(`keyword`);
        entryDiv.classList.add(`topic_${keywords[keyword]}`);
        entryDiv.classList.add(`static`);

        entryDiv.addEventListener('mouseover', (event) => { mouseoverFnc(event, keywords[keyword], keywords[keyword]) })
        entryDiv.addEventListener('click', (event) => { clickFnc(event, keywords[keyword], keywords[keyword]) })
        entryDiv.addEventListener('mouseout', (event) => { mouseoutFnc(event, keywords[keyword], keywords[keyword]) })
        // keywords.push(keyword)
        col.appendChild(entryDiv);
    
    })
  })
})

