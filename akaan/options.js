const DEFAULT_USE_FUTAPO_LINK = true;
const DEFAULT_USE_FTBUCKET_LINK = true;
const DEFAULT_USE_TSUMANNE_LINK = true;
const DEFAULT_SCROLL_TO_TOP = true;
const DEFAULT_CHANGE_BG_COLOR = true;
const DEFAULT_SEARCH_REPLY = true;
let use_futapo_link = null;
let use_ftbucket_link = null;
let use_tsumanne_link = null;
let scroll_to_top = null;
let change_bg_color = null;
let search_reply = null;

function onError(error) {
}

function safeGetValue(value, default_value) {
    return value === undefined ? default_value : value;
}

function saveSetting(e) {
    browser.storage.local.set({
        use_futapo_link:use_futapo_link.checked,
        use_ftbucket_link:use_ftbucket_link.checked,
        use_tsumanne_link:use_tsumanne_link.checked,
        scroll_to_top:scroll_to_top.checked,
        change_bg_color:change_bg_color.checked,
        search_reply:search_reply.checked
    });
}

function setCurrentChoice(result) {
    use_futapo_link.checked = safeGetValue(result.use_futapo_link, DEFAULT_USE_FUTAPO_LINK);
    use_ftbucket_link.checked = safeGetValue(result.use_ftbucket_link, DEFAULT_USE_FTBUCKET_LINK);
    use_tsumanne_link.checked = safeGetValue(result.use_tsumanne_link, DEFAULT_USE_TSUMANNE_LINK);
    scroll_to_top.checked = safeGetValue(result.scroll_to_top, DEFAULT_SCROLL_TO_TOP);
    change_bg_color.checked = safeGetValue(result.change_bg_color, DEFAULT_CHANGE_BG_COLOR);
    search_reply.checked = safeGetValue(result.search_reply, DEFAULT_SEARCH_REPLY);
}

function onLoad() {
    use_futapo_link = document.getElementById("use_futapo_link");
    use_ftbucket_link = document.getElementById("use_ftbucket_link");
    use_tsumanne_link = document.getElementById("use_tsumanne_link");
    scroll_to_top = document.getElementById("scroll_to_top");
    change_bg_color = document.getElementById("change_bg_color");
    search_reply = document.getElementById("search_reply");

    use_futapo_link.addEventListener("change", saveSetting);
    use_ftbucket_link.addEventListener("change", saveSetting);
    use_tsumanne_link.addEventListener("change", saveSetting);
    scroll_to_top.addEventListener("change", saveSetting);
    change_bg_color.addEventListener("change", saveSetting);
    search_reply.addEventListener("change", saveSetting);

    browser.storage.local.get().then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", onLoad);