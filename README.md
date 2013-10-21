# README

# TODO
* http://saoshi.gooside.com/ ←ここで動かない
* 非同期処理のエラー処理追加
* このextension使った一番最初、設定がない状態でバグらないようにする。
* 一気に多数のページをロードした時に、初期化がうまくいかない場合があるっぽい
    * chrome自体再起動したら再現しやすそう
    * background pageがロードされてないのにfrontendがbackgroundにsendMessageした場合に起こる気がする。initialize処理でbackgroundに問い合わせず、chrome.storageからデータ取ってくるようにしたから直ったのでは
* これ書く
* manifest.jsonのupdateと書式合わせたい
* coding standard的な

# BUGS
* ページが無効なfaviconを指定している場合、アルファベットのfaviconが消えない。

# OTHERS
* favicon提供元
    * 株式会社テトラクローマ http://tetrachroma.co.jp/blog/130820_dl_favicon/
