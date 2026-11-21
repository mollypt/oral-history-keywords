
const topics = []
const topic_prev = []
const col = document.querySelector(".column-container")
const co = [];
const segments = []
let panelOpen = false;
let metadata = {}
let selectedTopic = null;
let interviewIndex = 0
let aboutOpen = false;
const topicsPage = document.querySelector(".topics-container").cloneNode(true)
document.querySelector(".about-button").addEventListener("click", ()=> {
  document.querySelector(".about-blurb-container").classList.toggle("showing")
  reset()
  aboutOpen = aboutOpen ? false : true;
  document.querySelectorAll(".keyword").forEach(d => {
    d.classList.toggle("medium")
})

});

document.querySelector(".about-blurb-container .x").addEventListener("click", ()=> {
  document.querySelector(".about-blurb-container").classList.toggle("showing")
  document.querySelectorAll(".keyword").forEach(d => d.classList.toggle("blur"))
});

function pluralPair(a, b) {
  return (a + 's' == b || a == b + 's')
}

function verbPair(a,b) {
  return (a + 'ed' == b || a == b + 'ed')
}

function reset() {
  if (panelOpen || aboutOpen) return;

  selectedTopic = null
  document.querySelectorAll(`.keyword`).forEach(div => div.classList.remove("on"))
  document.querySelectorAll(`.keyword`).forEach(div => div.classList.remove("off"))
  document.querySelectorAll(`.keyword`).forEach(div => div.classList.remove("adj"))
  document.querySelectorAll(`.keyword`).forEach(div => div.classList.remove("pair"))
  document.querySelectorAll(`.keyword`).forEach(div => div.classList.remove("hidden"))
  document.querySelectorAll(`.keyword`).forEach(div => div.classList.add("static"))
  document.querySelectorAll(".column-container").forEach(d => d.classList.remove("blur"))
}

function scrollToDiv() {
  const element = document.querySelector(".text-block");
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener('mouseleave', () => {
    document.querySelectorAll(`.keyword`).forEach(div => {
    div.classList.remove("static-off")   
  })
});

function updateInterview(docs,event) {
  const numDocs = docs.length;
  if (interviewIndex==numDocs-1) {
    interviewIndex = 0
  }
  document.querySelector(".text-block").replaceChildren();
  const file = docs[interviewIndex].replace("segments", "formatted")
  // console.log("file: ", file)
  interviewIndex +=1
  let interviewID = file.split("/")[2].split('.txt')[0]
  interviewID = interviewID.substring(0, interviewID.lastIndexOf("-"))

  const interviewInfo = metadata[interviewID]
  const narrator = interviewInfo?.Narrator ?? null;
  if (!narrator) { 
    updateInterview(docs)
    return
  }
  const narratorFormat = narrator.replace(",", " & ")
  const interviewer = metadata[interviewID]["Interviewer"].replace(",", " & ")
  document.querySelector(".narrator").textContent = narratorFormat
  document.querySelector(".interviewer").textContent = 
    `Interviewed by ${interviewer} | ${metadata[interviewID]["Date"]}`;

    d3.text(file).then(text => {
    const speech = document.createElement("p");
    // speech.textContent = text.replace(/\<.*?\>/g, "");
    speech.textContent = text
    .replace(/<.*?>/g, "")
    .split(/\r?\n/)
    .filter(line => line.trim())
    .join("\n\n");

  
    document.querySelector(".text-block").appendChild(speech)
  }).catch(error => {
    console.error("Could not load data:", error, file);
    if (interviewIndex < docs.length) {
        updateInterview(docs);
    } else {
        document.querySelector(".text-block").textContent =
            "Unable to load interviews.";
    }
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
  document.querySelector(".x-button").addEventListener("click", (event) => {
    document.querySelector(".panel").classList.remove("active");
    panelOpen=false;
    reset()
  })
  updateInterview(docs)
}

function clickFnc(event, i) {
  if (panelOpen|| aboutOpen) return;
  if (selectedTopic) {
    if (document.querySelector(`.topic_${i}`).classList.contains('adj')) {
      // document.body.appendChild(textPage)
      drawConnections(selectedTopic.split("_")[1], i)
      document.querySelector(".panel").classList.add("active")
      document.querySelectorAll(".column-container").forEach(d => d.classList.add("blur"))
      document.querySelectorAll(".header").forEach(d => d.classList.add("off"))

      panelOpen=true;

      // populate first topic keyword containers 
      const parent1 = document.querySelector(".topic-list.first")
      parent1.replaceChildren(); // clear from previous
      const keywordArr1 = topics[selectedTopic.split("_")[1]].split(" ")
      keywordArr1.slice(0,13).forEach(keyword=>{
        const keywordDiv = document.createElement("div");
        keywordDiv.classList.add("keyword-container")
        keywordDiv.textContent = keyword;
        parent1.appendChild(keywordDiv)
      })

      const parent2 = document.querySelector(".topic-list.second")
      parent2.replaceChildren(); // clear from previous
      const keywordArr2 = topics[i].split(" ")
      keywordArr2.slice(0,13).forEach(keyword=>{
        const keywordDiv = document.createElement("div");
        keywordDiv.classList.add("keyword-container")
        keywordDiv.textContent = keyword;
        parent2.appendChild(keywordDiv)
      })
      // document.querySelector(".topic-list.first").textContent = topics[selectedTopic.split("_")[1]].replace(" ", "\n")
      // document.querySelector(".topic-list.second").textContent = topics[i].replace(" ", "\n")

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
  if (panelOpen || aboutOpen) return;
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
    if (panelOpen || aboutOpen) return;
    if (selectedTopic && document.querySelector(`.topic_${i}`).classList.contains('adj')) {
      // document.querySelector(".banner").textContent = topics[i] 
      // document.querySelector(".banner").classList.add('secondary')
      document.querySelectorAll(".adj").forEach(div=> {
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

    // do to: change path for git vs. local 
    d3.text("doc-topics.tsv").then(docTopicData => {
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
    topic.split(" ").slice(0, 10).forEach(keyword => {
      keywords[keyword.replace("_", " ")] = i
    })
  }})

  const sortedKeywords = new Set(Object.keys(keywords).sort((a, b) => a.localeCompare(b)));
  sortedKeywords.forEach(keyword => {
        if (keyword.length < 1) return;
        const entryDiv = document.createElement("div");
        entryDiv.classList.add('keyword')

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

