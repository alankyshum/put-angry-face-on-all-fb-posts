var scroll_to_bottom_feed = (callback) => {
  var scrolled = -1;
  var tryCnt = 0, scrollCnt = 0;
  var loopingPage = () => {
    if (scrollCnt > 15) {
      // keep scrolling too frequently (per second)
      clearInterval(scrollInterval);
      scrollCnt = 0;
      var timerLog = setInterval(() => {
        console.log("WATING 60 SECONDS TO CONTINUE SCROLLING");
      }, 1000);
      setTimeout(() => {
        scrollInterval = setInterval(loopingPage, 1000);
      }, 60);
    } else {
      if (scrolled !== window.scrollY) {
        scrolled = window.scrollY;
        window.scrollBy(0, 99999);
        scrollCnt++;
        tryCnt = 0;
        console.log("[scroll] scrolling");
      } else {
        if (tryCnt < 5) {
          tryCnt++; // wait for 5 sec until next page is loaded
        } else {
          console.log("[scrolling] DONE --> TRIGGER EMOTION BAR");
          // TODO: trigger emotion bar
          if (show_emotion_bar()) {
            callback();
          }
          clearInterval(scrollInterval);
        }
      }
    }
  }

  var scrollInterval = setInterval(loopingPage, 1000);
}

var show_emotion_bar = function() {
  // TRIGGER THE EMOTION BAR
  
    // if (!document.querySelector('._1oxj.accessible_elem')) {
  //   var reactionBar = document.querySelectorAll('.uiContextualLayerParent._khz');
  //   Object.keys(reactionBar).forEach((i) => {
  //     reactionBar[i].innerHTML += emotionBtnHTML;
  //   });
  //   console.log("EMOTION BAR TRIGGERED");
  // }
  // return !!document.querySelector('._1oxj.accessible_elem');
}

var click_btn_on_all_post_one_by_one = function(icons) {
  Object.keys(icons).forEach((i) => {
    if (icons[i].parentNode.getAttribute('aria-pressed')!="true") {
      console.log("[click on emoji] clicked");
      icons[i].click();
    }
  })
}

var put_reaction_on_all_post = function(emotion) {
  var reaction;
  switch (emotion) {
    case 'like': reaction = 1; break;
    case "love": reaction = 2; break;
    case "haha": reaction = 4; break;
    case "wow": reaction = 3; break;
    case "sad": reaction = 7; break;
    case "angry": reaction = 8; break;
  }
  var icons = document.querySelectorAll('._39m[data-reaction="' + reaction + '"]');
  click_btn_on_all_post_one_by_one(icons);
  return icons.length;
}

var cancel_all_emotion_on_post = function() {
  var cancel_btns = document.querySelectorAll('a.UFILikeLink.UFILinkBright');
  click_btn_on_all_post_one_by_one(cancel_btns);
  return cancel_btns.length;
}


/**
 * ==========================
 * MY JAVASCRIPT
 * ==========================
 */

chrome.runtime.onMessage.addListener((request, sender, sendRes) => {
  console.log(`ACTION: ${request.action}`);
  switch (request.action) {
    case "getPageTitle":
      sendRes(document.title);
      break;
    case "react":
      console.log(`EMOJI: ${request.emoji}`);
      scroll_to_bottom_feed(() => {
        var numPosts = put_reaction_on_all_post(request.emoji);
        sendRes(numPosts);
      });
      break;
    case "clearAll":
      console.log("Clearing all reactions on affected page");
      scroll_to_bottom_feed(() => {
        var numPosts = cancel_all_emotion_on_post();
        sendRes(`${numPosts} POSTS CLEARED`);
      });
      break;
    default:
      console.log(`NO ACTION DEFINED`);
      break;
  }
  return;
});
