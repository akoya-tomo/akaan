const DEFAULT_USE_FUTAPO_LINK = true;
const DEFAULT_USE_FTBUCKET_LINK = true;
const DEFAULT_USE_TSUMANNE_LINK = true;
const DEFAULT_CHANGE_BG_COLOR = true;
const DEFAULT_SEARCH_REPLY = true;
const DEFAULT_SEARCH_RESNO = true;
const DEFAULT_SEARCH_FILE = true;
const DEFAULT_POPUP_TIME = 100;
const DEFAULT_POPUP_INDENT = -20;
const DEFAULT_HIDE_TIME = 100;
const TEXT_COLOR = "#800000";
const BG_COLOR = "#F0E0D6";
const QUOTE_COLOR = "#789922";
const REPLY_COLOR = "#789922";
let use_futapo_link = DEFAULT_USE_FUTAPO_LINK;
let use_ftbucket_link = DEFAULT_USE_FTBUCKET_LINK;
let use_tsumanne_link = DEFAULT_USE_TSUMANNE_LINK;
let change_bg_color = DEFAULT_CHANGE_BG_COLOR;
let search_reply = DEFAULT_SEARCH_REPLY;
let search_resno = DEFAULT_SEARCH_RESNO;
let search_file = DEFAULT_SEARCH_FILE;
let popup_time = DEFAULT_POPUP_TIME;
let popup_indent = DEFAULT_POPUP_INDENT;
let hide_time = DEFAULT_HIDE_TIME;
let g_thre = null;
let g_response_list = [];
let g_last_response_num = 0;
let have_sod = false;
let have_del = false;

const SEARCH_RESULT_PERFECT = 0;
const SEARCH_RESULT_MAYBE = 1;
const SEARCH_RESULT_NONE = 2;

/**
 * 過去ログへのリンクを表示
 */
function dispLogLink() {
    let href_match = location.href.match(/^https?:\/\/([^/.]+)\.2chan\.net\/([^/]+)\/res\/(\d+)\.htm$/);
    let link_id, link, server, board;

    // ふたポ
    link_id = document.getElementById("AKAAN_futapo_link");
    if (use_futapo_link && !link_id && href_match
        && `${href_match[1]}_${href_match[2]}`.match(/may_b|img_b/)) {
        link = `http://kako.futakuro.com/futa/${href_match[1]}_${href_match[2]}/${href_match[3]}/`;
        setLogLink(link, "futapo");
    }

    // FTBucket
    link_id = document.getElementById("AKAAN_ftbucket_link");
    if (use_ftbucket_link && !link_id && href_match
        && `${href_match[1]}_${href_match[2]}`.match(/may_b|img_b|jun_jun|dec_55|dec_60/)) {
        board = `${href_match[1]}_${href_match[2]}` == "jun_jun" ? "b" : href_match[2];  // jun_junはjun_bに変換
        server = board == "b" ? href_match[1] : href_match[1] + href_match[2];
        link = `http://www.ftbucket.info/${server}/cont/${href_match[1]}.2chan.net_${board}_res_${href_match[3]}/index.htm`;
        setLogLink(link, "ftbucket");
    }

    // 「」ッチー
    link_id = document.getElementById("AKAAN_tsumanne_link");
    if (use_tsumanne_link && !link_id && href_match
        && `${href_match[1]}_${href_match[2]}`.match(/may_b|img_b|dat_b/)) {
        switch (href_match[1]) {
            case "may":
                server = "my";
                break;
            case "img":
                server = "si";
                break;
            case "dat":
                server = "sa";
                break;
            default:
                server = "";
                break;
        }
        if (server) {
            link = `http://tsumanne.net/${server}/indexes.php?sbmt=URL&w=${href_match[3]}.htm`;
            setLogLink(link, "tsumanne");
        }
    }

    /**
     * 過去ログへのリンクを設定
     * @param {string} link 過去ログのアドレス
     * @param {string} name リンクに表示されるテキスト
     */
    function setLogLink(link, name) {
        let span = document.createElement("span");
        let a = document.createElement("a");
        a.id = "AKAAN_" + name + "_link";
        a.href = link;
        a.target = "_blank";
        a.textContent = name;
        span.append("[", a, "] ");
        let akahuku_status = document.getElementById("akahuku_reload_status");
        if (akahuku_status) {
            akahuku_status.parentNode.insertBefore(span, akahuku_status);
        }
    }
}

class SearchTarget {
    constructor(index, linelist, resno, filename) {
        this.index = index;
        this.lines = linelist.slice();
        this.resno = resno;
        this.filename = filename;
    }

    searchText(text){
        let have_maybe = false;

        for(let i = 0; i < this.lines.length; ++i){
            let find = this.lines[i].indexOf(text);

            if(find != -1){
                if(text.length == this.lines[i].length){
                    return SEARCH_RESULT_PERFECT;
                }else{
                    have_maybe = true;
                }
            }else{
                continue;
            }
        }
        
        return have_maybe ? SEARCH_RESULT_MAYBE : SEARCH_RESULT_NONE;
    }

    searchResNo(no){
        // 検索文字列が数字の時はレスNo.の数字部分と比較
        if (no.match(/^\d+$/) && this.resno) {
            return this.resno.slice(3) == no;
        } else {
            return this.resno == no;
        }
    }

    searchFileName(name){
        // 検索文字列が数字の時はファイル名の数字部分と比較
        if (name.match(/^\d+$/) && this.filename.match(/^\d+/)) {
            return this.filename.match(/^\d+/)[0] == name;
        } else {
            return this.filename == name;
        }
    }

    static createByThre(thre) {
        let resno = "";
        let filename = "";

        if(search_resno){
            for (let node = thre.firstChild; node; node = node.nextSibling) {
                if (node.nodeType == Node.ELEMENT_NODE && node.nodeName == "BLOCKQUOTE") {
                    break;
                }

                if(node.nodeType == Node.TEXT_NODE){
                    let matches = node.nodeValue.match(/(No\.[0-9]+)/);
                    if (matches) {
                        resno = matches[1];
                        break;
                    }
                }
            }
        }

        if(search_file){
            let anchor = thre.getElementsByTagName("a")[0];
            if (anchor) {
                if (anchor.download) {
                    filename = anchor.download;
                } else if (anchor.dummyleafname) {
                    filename = anchor.dummyleafname;
                } else {
                    filename = anchor.textContent;
                }
            }
        }

        return new SearchTarget(
            0,
            thre.getElementsByTagName("blockquote")[0].innerText.split(/\r\n|\r|\n/),
            resno,
            filename);
    }

    static createByResponse(index, blockquote) {
        return new SearchTarget(
            index,
            blockquote.innerText.split(/\r\n|\r|\n/),
            search_resno ? SearchTarget.getResNo(blockquote) : "",
            search_file ? SearchTarget.getFileName(blockquote) : "");
    }

    static getResNo(blockquote) {
        for (let node = blockquote.parentNode.firstChild; node; node = node.nextSibling) {
            if (node.nodeType == Node.TEXT_NODE) {
                let matches = node.nodeValue.match(/(No\.[0-9]+)/);
                if (matches) {
                    return matches[1];
                }
            }
        }

        return "";
    }

    static getFileName(blockquote) {
        for (let i = 0, anchors = blockquote.parentElement.getElementsByTagName("a"); i < anchors.length; ++i) {
            let matches = anchors[i].href.match(/([0-9]+\.[0-9A-Za-z]+)/);
            if (matches) {
                return matches[1];
            }
        }

        return "";
    }
}

let search_targets = [];

/**
 * 引用ポップアップ制御クラス
 * @param {HTMLFontElement} green_text 引用のFont要素
 * @param {number} index 引用のあるレスのレス番号（スレ内の通番）
 * @constructor  
 */
class Quote {
    constructor(green_text, index) {
        this.green_text = green_text;
        this.index = index;
    }

    findOriginIndex(target_index = -1) {
        let search_text = this.green_text.innerText;
        search_text = search_text.slice(1).replace(/^[\s]+|[\s]+$/g, "");

        if (!search_text.length) return -1;

        if (target_index > -1) {
            let target = search_targets[target_index];

            if(search_resno && target.searchResNo(search_text)){
                return target.index;
            }

            if(search_file && target.searchFileName(search_text)){
                return target.index;
            }

            let result = target.searchText(search_text);
            if(result == SEARCH_RESULT_PERFECT){
                return target.index;
            }

        } else {
            for (let i = this.index - 1; i >= 0; --i) {
                let target = search_targets[i];

                if(search_resno && target.searchResNo(search_text)){
                    return target.index;
                }

                if(search_file && target.searchFileName(search_text)){
                    return target.index;
                }

                let result = target.searchText(search_text);
                if(result == SEARCH_RESULT_PERFECT){
                    return target.index;
                }
            }
        }

        return -1;
    }
}

/**
 * 返信レス番号ポップアップ制御クラス
 * @param {HTMLSpanElement} green_text 返信番号のSpan要素
 * @param {number} index 返信レスのレス番号（スレ内の通番）
 * @constructor  
 */
class Reply {
    constructor (green_text, index) {
        this.green_text = green_text;
        this.index = index;
        this.popup = null;
        this.mouseon = false;
        this.timer_show = false;
        this.timer_hide = false;

        let reply = this;

        this.green_text.addEventListener("mouseenter", (e) => {
            if (reply.mouseon) return;
            reply.mouseon = true;

            if (!reply.timer_show) {
                setTimeout(() => {
                    reply.timer_show = false;

                    if (reply.mouseon) {
                        reply.show(e);
                    }
                }, popup_time);

                reply.timer_show = true;
            }
        });

        this.green_text.addEventListener("mouseleave", (e) => {
            let related_target = e.relatedTarget;
            if (related_target === null) {
                document.addEventListener("click", hideReplyPopup, false);
                return;
            }
            reply.mouseon = false;
            if (!reply.timer_hide) {
                setTimeout(() => {
                    reply.timer_hide = false;
                    if (!reply.mouseon) {
                        reply.hide();
                    }
                }, hide_time);

                reply.timer_hide = true;
            }

            function hideReplyPopup(e) {
                let e_target_closest = false;
                for (let elm = e.target; elm; elm = elm.parentElement) {
                    if (elm == reply.green_text || elm == reply.popup) {
                        e_target_closest = true;
                    }
                }
                if (e.target !== null && !e_target_closest) {
                    document.removeEventListener("click", hideReplyPopup, false);
                    if (reply.mouseon) {
                        reply.mouseon = false;
                        reply.hide();
                    }
                }
            }
        });
    }

    createPopup() {
        this.popup = document.createElement("div");
        let target_id = null;
        // div要素を作りたいのでrd要素のクローンじゃだめ
        // g_response_listは最初のスレを含まないので-1
        for (let ch = g_response_list[this.index - 1].firstChild; ch != null; ch = ch.nextSibling) {
            if (ch.nodeType == Node.TEXT_NODE && /(No\.[0-9]+)/.test(ch.nodeValue)) {
                let matches = ch.nodeValue.match(/(.*)(No\.[0-9]+)(.*)/);
                let text1 = document.createTextNode(matches[1]);
                let text2 = document.createTextNode(matches[3]);
                let anchor = document.createElement("a");
                anchor.href = "javascript:void(0);";
                anchor.className = "AKAAN_popup_content_button";
                anchor.title = "このレスに移動";
                anchor.innerText = matches[2];
                anchor.addEventListener("click", () => {
                    this.mouseon = false;
                    this.hide();
                    moveToResponse(target_id);
                }, false);
                this.popup.append(text1, anchor, text2);
            } else if (ch.nodeType == Node.ELEMENT_NODE && ch.nodeName == "INPUT" && ch.id) {
                target_id = ch.id;
            } else {
                this.popup.appendChild(ch.cloneNode(true));
            }
        }

        this.popup.className = "AKAAN_reply_no_popup";
        this.popup.style.position = "absolute";
        this.popup.style.display = "block";
        this.popup.style.color = TEXT_COLOR;
        this.popup.style.backgroundColor = BG_COLOR;
        this.popup.style.border = "solid 1px";
        this.popup.style.zIndex = 6;
        this.popup.style.width = "auto";
        this.popup.style.maxWidth = "800px";
        this.popup.style.fontSize = "9pt";
        this.popup.mouseon = false;
        let reply = this;
        this.popup.addEventListener("mouseenter", () => {
            reply.mouseon = true;
        });
        this.popup.addEventListener("mouseleave", (e) => {
            let related_target = e.relatedTarget;
            if (related_target === null) {
                document.addEventListener("click", hidePopup, false);
                return;
            }
            reply.hide();
            reply.mouseon = false;

            function hidePopup(e) {
                let e_target_closest = false;
                for (let elm = e.target; elm; elm = elm.parentElement) {
                    if (elm == reply.green_text || elm == reply.popup) {
                        e_target_closest = true;
                    }
                }
                if (e.target !== null && !e_target_closest) {
                    document.removeEventListener("click", hidePopup, false);
                    reply.hide();
                    reply.mouseon = false;
                }
            }
        });
        document.body.appendChild(this.popup);
    }

    show(e) {
        if (this.popup) {
            this.popup.remove();
        }
        this.createPopup();

        if (this.popup) {
            let rc = Reply.getPopupPosition(e.clientX, e.clientY, this.green_text);

            this.popup.style.top = `${rc.top - 2}px`;
            this.popup.style.left = `${rc.left + popup_indent}px`;
            this.popup.style.display = "block";

            let hide_button = this.popup.getElementsByClassName("KOSHIAN_HideButton")[0];
            if (hide_button) {
                // KOSHIAN NG 改の[隠す]ボタンを削除
                hide_button.remove();
            }

            let ng_switch = this.popup.getElementsByClassName("KOSHIAN_NGSwitch")[0];
            if (ng_switch) {
                // KOSHIAN NG 改の[NGワード]ボタンを削除
                ng_switch.remove();
            }
        }
    }

    hide() {
        if (this.popup) {
            this.popup.remove();
        }
    }

    static getPopupPosition(mouse_client_x, mouse_client_y, elem) {
        let rc = {};

        let elem_position = elem.getBoundingClientRect();

        rc.left = (mouse_client_x + document.documentElement.scrollLeft);   // マウス位置をleftにする
        rc.top = (elem_position.bottom + document.documentElement.scrollTop); // elemの下辺をtopにする

        return rc;
    }

}

function searchReply(rtd, index) {
    let previous_index = -1, previous_quote = null;
    for (let i = 0, font_elements = rtd.getElementsByTagName("font"); i < font_elements.length; ++i) {
        if (font_elements[i].color == QUOTE_COLOR) {
            let quote = new Quote(font_elements[i], index);
            let origin_index = quote.findOriginIndex();
            if (origin_index > -1 && origin_index != previous_index) {
                putReplyNo(origin_index, index);
                if (previous_index > -1) {
                    // 引用元に前回探索した引用の引用元が存在したときは前回設置した返信No.を削除する
                    let previous_quote_index = previous_quote.findOriginIndex(origin_index);
                    if (previous_quote_index > -1) removeReplyNo(previous_index);
                }
                previous_index = origin_index;
                previous_quote = quote;
            }
        }
    }
}

function putReplyNo(origin_index, index) {
    let reply_no = document.createElement("span");
    reply_no.className = "AKAAN_ReplyNo";
    reply_no.textContent = `>>${index}`;
    reply_no.style.color = REPLY_COLOR;

    let response, reply_no_list, ng_button;
    if (origin_index) {
        // レス
        response = g_response_list[origin_index - 1];
        reply_no_list = response.getElementsByClassName("AKAAN_ReplyNo");
        ng_button = response.getElementsByClassName("KOSHIAN_HideButton")[0] || response.getElementsByClassName("KOSHIAN_NGSwitch")[0];
    } else {
        // スレ
        response = g_thre;
        reply_no_list = document.querySelectorAll(".thre > .AKAAN_ReplyNo");
        ng_button = null;
    }
    let target;
    if (reply_no_list.length) {
        target = reply_no_list[reply_no_list.length - 1].nextSibling;
    } else if (ng_button) {
        target = ng_button.nextSibling;
    } else if (have_sod) {
        target = response.getElementsByClassName("sod")[0].nextSibling;
    } else if (have_del) {
        target = response.getElementsByClassName("del")[0].nextSibling;
    } else {
        target = response.getElementsByTagName("blockquote")[0];
    }
    response.insertBefore(reply_no, target);
    response.insertBefore(document.createTextNode(" "), reply_no);
    new Reply(reply_no, index);
}

function removeReplyNo(index) {
    let response, reply_no_list;
    if (index) {
        // レス
        response = g_response_list[index - 1];
        reply_no_list = response.getElementsByClassName("AKAAN_ReplyNo");
    } else {
        // スレ
        response = g_thre;
        reply_no_list = document.querySelectorAll(".thre > .AKAAN_ReplyNo");
    }
    if (reply_no_list.length) {
        let target = reply_no_list[reply_no_list.length - 1];
        response.removeChild(target.previousSibling);   // 空白テキスト
        response.removeChild(target);
    }
}

function process(beg, end){
    // add search targets
    for(let i = beg; i < end; ++i){
        search_targets.push(SearchTarget.createByResponse(i + 1, g_response_list[i].getElementsByTagName("blockquote")[0]));
    }

    // create popup
    for(let i = beg; i < end; ++i){
        searchReply(g_response_list[i], i + 1);
    }
}

function main() {
    g_thre = document.getElementsByClassName("thre")[0];
    if (g_thre == null) {
        return;
    }

    let reply_no_list = g_thre.getElementsByClassName("AKAAN_ReplyNo");
    while (reply_no_list.length) {
        reply_no_list[0].remove();
    }

    if (search_reply) {
        g_response_list = g_thre.getElementsByClassName("rtd");
        have_sod = document.getElementsByClassName("sod").length > 0;
        have_del = document.getElementsByClassName("del").length > 0;

        // add search targets by thre
        search_targets.push(SearchTarget.createByThre(g_thre));

        process(0, g_response_list.length);
        g_last_response_num = g_response_list.length;
    }

    let status = "";
    let target = document.getElementById("akahuku_reload_status");
    if (target) {
        checkAkahukuReload();
    } else {
        document.addEventListener("AkahukuContentApplied", () => {
            target = document.getElementById("akahuku_reload_status");
            if (target) checkAkahukuReload();
        });
    }
    function checkAkahukuReload() {
        let config = { childList: true };
        let observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (target.textContent == status) return;
                status = target.textContent;
                if (status == "ロード中 (ヘッダ)") {
                    if (change_bg_color) document.body.style.backgroundColor = '#EEEEEE';
                } else
                if (status.indexOf("新着") === 0) {
                    document.body.style.backgroundColor = null;

                    if (search_reply) {
                        let prev_res_num = g_last_response_num;
                        let cur_res_num = g_response_list.length;
                        process(prev_res_num, cur_res_num);
                        g_last_response_num = cur_res_num;
                    }
                } else
                if (status.indexOf("No") === 0 || status.indexOf("Mot") === 0) {
                    document.body.style.backgroundColor = null;
                    dispLogLink();
                } else
                if (status.indexOf("中断") === 0 || status.indexOf("接続") === 0 || status.indexOf("load error:") === 0 || status.indexOf("ロード失敗") === 0) {
                    document.body.style.backgroundColor = null;
                }
            });
        });
        observer.observe(target, config);
    }
}

/**
 * 指定したレスへスクロール
 * @param {string} reply_id レスのcheckboxのid名
 */
function moveToResponse(reply_id){
    if (!reply_id) return;
    let target = document.getElementById(reply_id);
    if (target) {
        target.scrollIntoView(true);

        target.parentElement.style.backgroundColor = "#ffcc99";
        setTimeout(() => {
            target.parentElement.style.backgroundColor = "";
        }, 2000);

        let blockquote = target.parentElement.getElementsByTagName("blockquote")[0];
        if (blockquote) {
            let range = document.createRange();
            range.selectNodeContents(blockquote);
            let selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
}

function safeGetValue(value, default_value) {
    return value === undefined ? default_value : value;
}

browser.storage.local.get().then((result) => {
    use_futapo_link = safeGetValue(result.use_futapo_link, DEFAULT_USE_FUTAPO_LINK);
    use_ftbucket_link = safeGetValue(result.use_ftbucket_link, DEFAULT_USE_FTBUCKET_LINK);
    use_tsumanne_link = safeGetValue(result.use_tsumanne_link, DEFAULT_USE_TSUMANNE_LINK);
    change_bg_color = safeGetValue(result.change_bg_color, DEFAULT_CHANGE_BG_COLOR);
    search_reply = safeGetValue(result.search_reply, DEFAULT_SEARCH_REPLY);

    main();
}, (error) => { });

browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName != "local") {
        return;
    }

    use_futapo_link = safeGetValue(changes.use_futapo_link.newValue, DEFAULT_USE_FUTAPO_LINK);
    use_ftbucket_link = safeGetValue(changes.use_ftbucket_link.newValue, DEFAULT_USE_FTBUCKET_LINK);
    use_tsumanne_link = safeGetValue(changes.use_tsumanne_link.newValue, DEFAULT_USE_TSUMANNE_LINK);
    change_bg_color = safeGetValue(changes.change_bg_color.newValue, DEFAULT_CHANGE_BG_COLOR);
    //search_reply = safeGetValue(changes.search_reply.newValue, DEFAULT_SEARCH_REPLY); // 「レスへの返信を探す」はリロードするまで反映しない
});