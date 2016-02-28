/*
  GLOBAL VARIABLES
 */

var fbPages = {};
var emoji = document.querySelector('.reactionRow .btn.selected').dataset.emoji;
var action = {};


/*
  BUTTON ACTIONS
 */

// DETECT FACEBOOK PAGES ON ANY CHROME WINDOW
var selectTab = (e) => {
  var id = e.dataset.tabid;
  e = e.getElementsByTagName('i')[0];
  e.classList.toggle("fa-square-o");
  e.classList.toggle("fa-check-square-o");
  fbPages[id].selected = !fbPages[id].selected;
}

action.detectFbPages = () => {
  console.log("DETECTING FACEBOOK PAGES");
  chrome.tabs.query({url: "https://*.facebook.com/*"}, (tabs) => {
    var itemList = document.querySelector('#detectedPages ul');
    itemList.innerHTML = "";
    fbPages = {};
    tabs.forEach((tab, tabI) => {
      chrome.tabs.sendMessage(tab.id, {action: "getPageTitle"}, (res) => {
        console.log(res);
        fbPages[tab.id] = {
          title: res,
          selected: false
        }
        var item = document.createElement('li');
        item.classList.add("list-group-item");
        item.dataset.tabid = tab.id;
        var itemIcon = document.createElement('i');
        itemIcon.classList.add('fa');
        itemIcon.classList.add('fa-square-o');
        item.appendChild(itemIcon);
        item.innerHTML += ` <span>${res}</span>`;
        item.onclick = () => { selectTab(item); };
        itemList.appendChild(item);
      });
    })
  });
}
action.detectFbPages();
document.getElementById('detectBtn').addEventListener('click', action.detectFbPages);

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
action.track = () => {

}
document.getElementById('trackBtn').addEventListener('click', action.track);

// REACT TO ALL POSTS ON SELECTED FB PAGES WITH THE SAME REACTION
action.bomb = () => {
  Object.keys(fbPages).forEach((id) => {
    console.log(`${fbPages[id].title}: ${fbPages[id].selected}`);
    if (fbPages[id].selected) {
      console.log(`Bombing ${id} with ${emoji}`);
      chrome.tabs.sendMessage(parseInt(id), {action: "react", emoji: emoji}, (res) => {
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
      chrome.tabs.sendMessage(parseInt(id), {action: "clearAll"}, (res) => {
        console.log(res);
      });
    }
  })
}
document.getElementById('clearBtn').addEventListener('click', action.clearAll);
