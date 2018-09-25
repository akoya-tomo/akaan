## 赤餡
このFirefoxアドオンは[赤福Extended](https://toshiakisp.github.io/akahuku-firefox-sp/)にちょっとだけおまけ機能を追加します。  

※このアドオンはWebExtensionアドオン対応のFirefox専用となります。  
※このアドオンは赤福Extendedがインストールされていることが前提となります。  
※他の赤福Extendedと併用できるツールは[こちら](https://github.com/akoya-tomo/futaba_auto_reloader_K/wiki/赤福Extended版との併用について/)。  

## 機能
* ![\(New\)](images/new.png "New") 「レスへの返信を探す」オプションを追加（デフォルト：有効）  
  - レスに対して返信しているレスの番号をレスの右上に表示します。返信レス番号にマウスオーバーすると返信レスがポップアップします。  
    <img src="images/screenshot01.png?raw=true" alt="スクリーンショット" title="スクリーンショット" width="700px">  
* リロード時にスレが消えていたらポータルサイト[ふたポ](http://futapo.futakuro.com/)\(futapo\)の過去ログ\(kako.futakuro.com\)へのリンクを表示（二次元裏may・imgのみ）（デフォルト：有効）
* カタログでリロード時にページトップに移動（デフォルト：有効）
* リロード中の背景色を変更（デフォルト：有効）

## インストール
**GitHub**  
[![インストールボタン](images/install_button.png "クリックでアドオンをインストール")](https://github.com/akoya-tomo/akaan/releases/download/v1.1.0/akaan-1.1.0-fx.xpi)

※v1.1.0からアドオンを実行するサイトにふたポの過去ログ(kako.futakuro.com)が追加になります。  
※「接続エラーのため、アドオンをダウンロードできませんでした。」と表示されてインストール出来ないときはリンクを右クリックしてxpiファイルをダウンロードし、メニューのツール→アドオン（またはCtrl+Shift+A）で表示されたアドオンマネージャーのページにxpiファイルをドラッグ＆ドロップして下さい。  

## 注意事項  
* 「レスへの返信を探す」オプションの設定を変更したときは開いているスレを更新することで設定が反映されます。  
* 返信ポップアップ上からは更なる返信ポップアップはしません。  

## 既知の不具合  
* [ねないこ](http://nenaiko.sakura.ne.jp/nenaiko/)使用時に返信ポップアップが正常に表示されない  

## 更新履歴
* v1.1.0 2018-09-23
  - レスへの返信を探すオプションを追加  
  - 「リロード中は背景色を変える」オプションの変更が保存されないことがある不具合を修正
  - アドオンを実行するサイトにふたポの過去ログ(kako.futakuro.com)を追加
* v1.0.1 2018-09-16
  - 新規リリース  
