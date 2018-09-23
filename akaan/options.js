const DEFAULT_USE_FUTAPO_LINK = true;
const DEFAULT_SCROLL_TO_TOP = true;
const DEFAULT_CHANGE_BG_COLOR = true;
const DEFAULT_SEARCH_REPLY = true;
let use_futapo_link = DEFAULT_USE_FUTAPO_LINK;
let scroll_to_top = DEFAULT_SCROLL_TO_TOP;
let change_bg_color = DEFAULT_CHANGE_BG_COLOR;
let search_reply = null;

function onError(error) {
}

function safeGetValue(value, default_value) {
    return value === undefined ? default_value : value;
}

function saveSetting(e) {
    browser.storage.local.set({
        use_futapo_link:use_futapo_link.checked,
        scroll_to_top:scroll_to_top.checked,
        change_bg_color:change_bg_color.checked,
        search_reply:search_reply.checked
    });
}

function setCurrentChoice(result) {
    use_futapo_link.checked = safeGetValue(result.use_futapo_link, DEFAULT_USE_FUTAPO_LINK);
    scroll_to_top.checked = safeGetValue(result.scroll_to_top, DEFAULT_SCROLL_TO_TOP);
    change_bg_color.checked = safeGetValue(result.change_bg_color, DEFAULT_CHANGE_BG_COLOR);
    search_reply.checked = safeGetValue(result.search_reply, DEFAULT_SEARCH_REPLY);
}

function onLoad() {
    use_futapo_link = document.getElementById("use_futapo_link");
    scroll_to_top = document.getElementById("scroll_to_top");
    change_bg_color = document.getElementById("change_bg_color");
    search_reply = document.getElementById("search_reply");

    use_futapo_link.addEventListener("change", saveSetting);
    scroll_to_top.addEventListener("change", saveSetting);
    change_bg_color.addEventListener("change", saveSetting);
    search_reply.addEventListener("change", saveSetting);

    browser.storage.local.get().then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", onLoad);