var scroll_to_bottom_feed = (callback) => {
  var scrolled = -1;
  var tryCnt = 0;
  var scrollInterval = setInterval(() => {
    if (scrolled !== window.scrollY) {
      scrolled = window.scrollY;
      window.scrollBy(0, 99999);
      tryCnt = 0;
      console.log("[scroll] scrolling");
    } else {
      if (tryCnt < 5) {
        tryCnt++;
      } else {
        clearInterval(scrollInterval);
        callback();
      }
    }
  }, 1000);
}

var show_emotion_bar = function() {
  var emontion_bar_parent = $('.uiContextualLayerParent ._khz > div');
  for (var i = 0; i < emontion_bar_parent.length; ++i) {
    emontion_bar_parent[i].className = "_1oxj _10ir";
  }
}

var click_btn_on_all_post_one_by_one = function(icons) {
  Object.keys(icons).forEach((i) => {icons[i].click();})
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
        cancel_all_emotion_on_post();
        sendRes("ALL CLEARED");
      });
      break;
    default:
      console.log(`NO ACTION DEFINED`);
      break;
  }
  return;
});
