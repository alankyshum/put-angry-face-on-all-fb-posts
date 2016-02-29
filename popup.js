/*
  GLOBAL VARIABLES
 */

var syncTime = {};
var fbPages = {};
var emoji = document.querySelector('.reactionRow .btn.selected').dataset.emoji;
var action = {};

chrome.storage.sync.get("reactedTime", (items) => {
  if (Object.keys(items).length) {
    syncTime = items.reactedTime;
  } else {
    chrome.storage.sync.set({"reactedTime": syncTime}, () => {
      console.log("[SYNC] INIT SYNC TIME");
    });
  }
})

/*
  BUTTON ACTIONS
 */

var selectTab = (e) => {
  var id = e.dataset.tabid;
  e = e.getElementsByTagName('i')[0];
  e.classList.toggle("fa-square-o");
  e.classList.toggle("fa-check-square-o");
  fbPages[id].selected = !fbPages[id].selected;
}

// DETECT FACEBOOK PAGES ON ANY CHROME WINDOW
action.detectFbPages = () => {
  console.log("DETECTING FACEBOOK PAGES");
  // TMP WORKAROUND
  chrome.tabs.query({active: true}, (tabs) => {
    var currentTabId = tabs[0].id;
    chrome.tabs.query({url: "https://*.facebook.com/*"}, (tabs) => {
      var itemList = document.querySelector('#detectedPages ul');
      itemList.innerHTML = "";
      fbPages = {};
      tabs.forEach((tab, tabI) => {
        chrome.tabs.sendMessage(tab.id, {action: "getPageTitle"}, (res) => {
          console.log(res);
          fbPages[tab.id] = {
            title: res.replace(/\(\d+\)/, '').trim(),
            selected: false
          }
          var item = document.createElement('li');
          item.classList.add("list-group-item");
          item.dataset.tabid = tab.id;
          var itemIcon = document.createElement('i');
          itemIcon.classList.add('fa');
          itemIcon.classList.add('fa-square-o');
          item.appendChild(itemIcon);
          if (tab.id == currentTabId) {
            selectTab(item);
            console.log(item);
          }
          var lastBombedTime = syncTime[fbPages[tab.id].title];
          if (lastBombedTime) {
            var thatDate = new Date(lastBombedTime);
            var dateString = thatDate.toString().match(/\w+ \d+ \d+ \d+:\d+/)[0];
            lastBombedTime = ` (${dateString})`
          }
          else lastBombedTime = "";
          // item.dataset.timestamp = thatDate.valueOf();

          item.innerHTML += ` <span>${res}${lastBombedTime}</span>`;
          item.onclick = () => { selectTab(item); };
          itemList.appendChild(item);
        });
      })
    });
  });
}
action.detectFbPages();
// document.getElementById('detectBtn').addEventListener('click', action.detectFbPages);

// SELECT EMOJI
action.selectEmoji = (emojiBtn) => {
  emoji = emojiBtn.dataset.emoji;
  document.querySelector('.reactionRow .btn.selected').classList.remove("selected");
  emojiBtn.classList.add("selected");
}
var reactionBtns = document.querySelectorAll('.reactionRow .btn');
Object.keys(reactionBtns).forEach((i) => {
  reactionBtns[i].addEventListener('click', () => {
    action.selectEmoji(reactionBtns[i])
  })
});


// AUTO REACT TO NEW POSTS FROM TRACKED PAGES
// action.track = () => {
//
// }
// document.getElementById('trackBtn').addEventListener('click', action.track);


// REACT TO ALL POSTS ON SELECTED FB PAGES WITH THE SAME REACTION
action.bomb = () => {
  Object.keys(fbPages).forEach((id) => {
    console.log(`${fbPages[id].title}: ${fbPages[id].selected}`);
    if (fbPages[id].selected) {
      syncTime[fbPages[id].title] = String(new Date());
      chrome.storage.sync.set({"reactedTime": syncTime}, () => {
        console.log("[SYNC] INIT SYNC TIME");
      });
      console.log(`Bombing ${id} with ${emoji}`);
      chrome.tabs.sendMessage(parseInt(id), {action: "react", emoji: emoji, scrollCnt: document.getElementById('scrollCnt').value}, (res) => {
        console.log(`${res} posts reacted!`);
      });
    }
  })
}
document.getElementById('bombBtn').addEventListener('click', action.bomb);


// CLEAR ALL POST REACTIONS
action.clearAll = () => {
  Object.keys(fbPages).forEach((id) => {
    console.log(`${fbPages[id].title}: ${fbPages[id].selected}`);
    if (fbPages[id].selected) {
      console.log(`Clearing ${id}`);
      syncTime[fbPages[id].title] = null;
      chrome.storage.sync.set({"reactedTime": syncTime}, () => {
        console.log("[SYNC] INIT SYNC TIME");
      });
      chrome.tabs.sendMessage(parseInt(id), {action: "clearAll", scrollCnt: document.getElementById('scrollCnt').value}, (res) => {
        console.log(res);
      });
    }
  })
}
document.getElementById('clearBtn').addEventListener('click', action.clearAll);
