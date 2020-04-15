## 赤餡
この Firefoxアドオンは[赤福Extended](https://toshiakisp.github.io/akahuku-firefox-sp/)にちょっとだけおまけ機能を追加します。  

※このアドオンは WebExtensionアドオン対応の Firefox専用となります。  
※このアドオンは赤福Extendedがインストールされていることが前提となります。  
※他の赤福Extendedと併用できるツールは[こちら](https://github.com/akoya-tomo/futaba_auto_reloader_K/wiki/赤福Extended版との併用について/)。  

## 機能
* 「レスへの返信を探す」オプションを追加（デフォルト：有効）  
  - レスに対して返信しているレスの番号をレスの右上に表示します。返信レス番号にマウスオーバーすると返信レスがポップアップします。  
    <img src="images/screenshot01.png?raw=true" alt="スクリーンショット" title="スクリーンショット" width="700px">  
* リロード時にスレが消えていたらログサイトへのリンクを表示（デフォルト：有効）  
* カタログでリロード時にページトップに移動（デフォルト：有効）
* リロード中の背景色を変更（デフォルト：有効）
* 左ダブルクリックでスレのタブとカタログのタブを移動（デフォルト：無効）
  - スレのページ内で左ダブルクリックするとそのスレの板のカタログのタブに移動します。  
  - カタログのページ内で左ダブルクリックすると最後に左ダブルクリックでカタログに移動したスレのタブに戻ります。  
  - 特定の範囲内では左ダブルクリックによる移動を無効にすることができます。（デフォルト：無効）  
  - 該当するタブが既に閉じられていて存在しない場合は移動しません。  
* 右ダブルクリックで新着レスのあるスレのタブに移動（デフォルト：無効）
  - スレ・カタログ・\[n\]ページで右ダブルクリックすると [futaba auto reloader](https://greasyfork.org/ja/scripts/8185-futaba-auto-reloader) \([K](https://greasyfork.org/ja/scripts/36235-futaba-auto-reloader-k)\) の新着レス表示があるスレのタブを順番に移動します。  
  - 新着レスのあるスレが無いときはカタログ・\[n\]ページのタブを順番に移動します。  
  - 右ダブルクリックを受け付ける時間を設定できます。（デフォルト：350ms）  
  - 右ダブルクリック後に表示されるコンテキストメニューが邪魔なときは  
    「右ボタンを設定時間以上長押しでコンテキストメニュー表示」を設定してコンテキストメニューを表示するときに右ボタンを長押しすることで、右ダブルクリック時のコンテキストメニューの表示を回避できます。  
    （デフォルト：0ms = 右クリックで常にコンテキストメニュー表示）  
* カタログのリロード時に新着スレにプルダウンメニューボタンを設置（デフォルト：有効）
  -  新着スレにプルダウンメニューボタンを設置します。   

## インストール
**GitHub**  
[![インストールボタン](images/install_button.png "クリックでアドオンをインストール")](https://github.com/akoya-tomo/akaan/releases/download/v2.2.3/akaan-2.2.3-fx.xpi)

※v2.0.0からアドオンが動作するFirefoxのバージョンが57以降になりました。  
※ふたば以外にログサイトとタブへのアクセス許可が必要です。  
  （アドオンの実行・該当スレのログの有無の確認・別のタブへの移動）  

※「接続エラーのため、アドオンをダウンロードできませんでした。」と表示されてインストール出来ないときはリンクを右クリックしてxpiファイルをダウンロードし、メニューのツール→アドオン（またはCtrl+Shift+A）で表示されたアドオンマネージャーのページにxpiファイルをドラッグ＆ドロップして下さい。  

## 注意事項  
* 「レスへの返信を探す」オプションの設定を変更したときは開いているスレを更新することで設定が反映されます。  
* 返信ポップアップ上からは更なる返信ポップアップはしません。  
* スレ登録型ログサイトは該当スレのログが存在するときだけリンクが表示されます。  
* 「ダブルクリックでスレ⇔カタログを移動する」を有効にするときは [futaba move to catalog](https://greasyfork.org/ja/scripts/36988-futaba-move-to-catalog) スクリプトは無効にしてください。  
* `about:config` で `privacy.resistFingerprinting` が `true` に設定されている場合、右ダブルクリックや長押しの検出が不安定になる可能性があります。  
* 返信レスをポップアップ表示中にリロードするとポップアップが閉じます。  

## Tips
* [MouseGestureL.ahk](http://hp.vector.co.jp/authors/VA018351/mglahk.html) 使用時は「右ボタンを設定時間以上長押しでコンテキストメニュー表示」が動作しません。  
  （長押ししても必ずクリック動作になるため）  
  MouseGestureL.ahk の設定から「ボタンを放した後に追加ジェスチャーの入力を許容する時間」を設定して `RB__RB__` ジェスチャー（右ボタンクリック2回）に以下の設定をすることで新着レスのあるスレに移動後コンテキストメニューを隠すことができます。（空きボタンへの割り当てでも可）  

  ```
  MG_Click("RB",,2)
  sleep, 200
  Send, {Escape}
  ```

  2行目の sleep の時間は環境に合わせて調整してください。  
  ターゲットを Firefox限定にすることで他への影響を抑えられます。  

## ライセンス
* スレのプルダウンメニューボタン設置の処理でふたば☆ちゃんねるのcat.jsのコードの一部を改変して使用しています。  


## 更新履歴
* v2.2.3 2020-04-15
  - カタログのリロードでプルダウンメニューボタン設置中にエラーになる不具合を修正
* v2.2.2 2020-04-15
  - ログサイトを更新
* v2.2.1 2020-03-11
  - カタログリロード時にプルダウンメニューを消去するように修正
* v2.2.0 2020-03-05
  - カタログのリロード時に新着スレにプルダウンメニューボタンを設置するオプションを追加
  - カタログのリロード監視を修正
* v2.1.0 2019-12-07
  - 記事番号のメニュー化により記事番号で返信したレスが返信レス番号で表示されない不具合を修正
  - 記事番号のメニュー化により返信レスポップアップ内の記事番号をクリックしても移動しない不具合を修正
  - 返信ポップアップ表示中にリロードすると赤福の動作がおかしくなる不具合を修正
  - その他細かい修正
* v2.0.0 2019-06-25
  - 左ダブルクリックでスレのタブとカタログのタブを移動する機能を追加
  - 右ダブルクリックで新着レスのあるスレのタブに移動する機能を追加
  - アドオンが動作する Firefox のバージョンを57以降に変更
* v1.5.1 2019-05-14
  - 返信レスポップアップが画面右端より外に表示されないように修正
* v1.5.0 2019-05-04
  - 全てのスレ登録型ログサイトで該当スレのログが無いときはリンクを表示しないように修正
* v1.4.0 2019-05-02
  - 一部のスレ登録型ログサイトで該当スレのログが無いときはリンクを表示しないように修正
* v1.3.0 2019-04-26
  - ログサイトを更新
* v1.2.2 2019-04-13
  - 引用が複数行あるときの引用元レスの探索精度を改善
* v1.2.1 2018-12-20
  - 改行だけの引用があると「レスへの返信を探す」が正常に表示されない不具合を修正
* v1.2.0 2018-10-26
  - [ねないこ](http://nenaiko.sakura.ne.jp/nenaiko/)使用時に返信ポップアップが正常に表示されない不具合を修正
  - リロードが正常に完了しなかったときに背景色が変更されたままになる不具合を修正
* v1.1.0 2018-09-23
  - レスへの返信を探すオプションを追加  
  - 「リロード中は背景色を変える」オプションの変更が保存されないことがある不具合を修正
  - アドオンを実行するサイトにふたポの過去ログを追加
* v1.0.1 2018-09-16
  - 新規リリース  
