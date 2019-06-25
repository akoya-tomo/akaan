const DEFAULT_SCROLL_TO_TOP = true;
const DEFAULT_CHANGE_BG_COLOR = true;
//const DEFAULT_SHOW_DELETED_RES = true;
const DEFAULT_SEARCH_REPLY = true;
const DEFAULT_USE_FUTAPO_LINK = true;
const DEFAULT_USE_FTBUCKET_LINK = true;
const DEFAULT_USE_TSUMANNE_LINK = true;
const DEFAULT_USE_DOUBLECLICK = false;
const DEFAULT_DISABLE_FORMS = true;
const DEFAULT_DISABLE_CLASS_RTD = false;
const DEFAULT_DISABLE_ID_CATTABLE = false;
const DEFAULT_FOCUS_ON_UNREAD = false;
const DEFAULT_CLICK_PERIOD = 350;
const DEFAULT_LONG_PRESS_TIME = 0;

let scroll_to_top = null;
let change_bg_color = null;
//let show_deleted_res = null;
let search_reply = null;
let use_futapo_link = null;
let use_ftbucket_link = null;
let use_tsumanne_link = null;
let g_use_doubleclick = null;
let g_disable_forms = null;
let g_disable_class_rtd = null;
let g_disable_id_cattable = null;
let g_focus_on_unread = null;
let g_click_period = null;
let g_long_press_time = null;

function onError(error) {   // eslint-disable-line no-unused-vars
}

function safeGetValue(value, default_value) {
    return value === undefined ? default_value : value;
}

function saveSetting(e) {   // eslint-disable-line no-unused-vars
    browser.storage.local.set({
        scroll_to_top:scroll_to_top.checked,
        change_bg_color:change_bg_color.checked,
        //show_deleted_res:show_deleted_res.checked,
        search_reply:search_reply.checked,
        use_futapo_link:use_futapo_link.checked,
        use_ftbucket_link:use_ftbucket_link.checked,
        use_tsumanne_link:use_tsumanne_link.checked,
        use_doubleclick: g_use_doubleclick.checked,
        disable_forms: g_disable_forms.checked,
        disable_class_rtd: g_disable_class_rtd.checked,
        disable_id_cattable: g_disable_id_cattable.checked,
        focus_on_unread: g_focus_on_unread.checked,
        click_period: g_click_period.value,
        long_press_time: g_long_press_time.value
    });
}

function setCurrentChoice(result) {
    scroll_to_top.checked = safeGetValue(result.scroll_to_top, DEFAULT_SCROLL_TO_TOP);
    change_bg_color.checked = safeGetValue(result.change_bg_color, DEFAULT_CHANGE_BG_COLOR);
    //show_deleted_res.checked = safeGetValue(result.show_deleted_res, DEFAULT_SHOW_DELETED_RES);
    search_reply.checked = safeGetValue(result.search_reply, DEFAULT_SEARCH_REPLY);
    use_futapo_link.checked = safeGetValue(result.use_futapo_link, DEFAULT_USE_FUTAPO_LINK);
    use_ftbucket_link.checked = safeGetValue(result.use_ftbucket_link, DEFAULT_USE_FTBUCKET_LINK);
    use_tsumanne_link.checked = safeGetValue(result.use_tsumanne_link, DEFAULT_USE_TSUMANNE_LINK);
    g_use_doubleclick.checked = safeGetValue(result.use_doubleclick, DEFAULT_USE_DOUBLECLICK);
    g_disable_forms.checked = safeGetValue(result.disable_forms, DEFAULT_DISABLE_FORMS);
    g_disable_class_rtd.checked = safeGetValue(result.disable_class_rtd, DEFAULT_DISABLE_CLASS_RTD);
    g_disable_id_cattable.checked = safeGetValue(result.disable_id_cattable, DEFAULT_DISABLE_ID_CATTABLE);
    g_focus_on_unread.checked = safeGetValue(result.focus_on_unread, DEFAULT_FOCUS_ON_UNREAD);
    g_click_period.value = safeGetValue(result.click_period, DEFAULT_CLICK_PERIOD);
    g_long_press_time.value = safeGetValue(result.long_press_time, DEFAULT_LONG_PRESS_TIME);
  
    g_disable_forms.disabled = !g_use_doubleclick.checked;
    g_disable_class_rtd.disabled = !g_use_doubleclick.checked;
    g_disable_id_cattable.disabled = !g_use_doubleclick.checked;
  
    g_click_period.disabled = !g_focus_on_unread.checked;
    g_long_press_time.disabled = !g_focus_on_unread.checked;
}

function onLoad() {
    scroll_to_top = document.getElementById("scroll_to_top");
    change_bg_color = document.getElementById("change_bg_color");
    //show_deleted_res = document.getElementById("show_deleted_res");
    search_reply = document.getElementById("search_reply");
    use_futapo_link = document.getElementById("use_futapo_link");
    use_ftbucket_link = document.getElementById("use_ftbucket_link");
    use_tsumanne_link = document.getElementById("use_tsumanne_link");
    g_use_doubleclick = document.getElementById("use_doubleclick");
    g_disable_forms = document.getElementById("disable_forms");
    g_disable_class_rtd = document.getElementById("disable_class_rtd");
    g_disable_id_cattable = document.getElementById("disable_id_cattable");
    g_focus_on_unread = document.getElementById("focus_on_unread");
    g_click_period = document.getElementById("click_period");
    g_long_press_time = document.getElementById("long_press_time");
  
    scroll_to_top.addEventListener("change", saveSetting);
    change_bg_color.addEventListener("change", saveSetting);
    //show_deleted_res.addEventListener("change", saveSetting);
    search_reply.addEventListener("change", saveSetting);
    use_futapo_link.addEventListener("change", saveSetting);
    use_ftbucket_link.addEventListener("change", saveSetting);
    use_tsumanne_link.addEventListener("change", saveSetting);
    g_use_doubleclick.addEventListener("change", () => {
        g_disable_forms.disabled = !g_use_doubleclick.checked;
        g_disable_class_rtd.disabled = !g_use_doubleclick.checked;
        g_disable_id_cattable.disabled = !g_use_doubleclick.checked;
        saveSetting();
    });
    g_disable_forms.addEventListener("change", saveSetting);
    g_disable_class_rtd.addEventListener("change", saveSetting);
    g_disable_id_cattable.addEventListener("change", saveSetting);
    g_focus_on_unread.addEventListener("change", () => {
        g_click_period.disabled = !g_focus_on_unread.checked;
        g_long_press_time.disabled = !g_focus_on_unread.checked;
        saveSetting();
    });
    g_click_period.addEventListener("change", saveSetting);
    g_long_press_time.addEventListener("change", saveSetting);
    
    browser.storage.local.get().then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", onLoad);
