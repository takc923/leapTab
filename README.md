# README

# TODO
* これ書く
* タブ操作front<-->backgroundでピンポンしなくてもbackgroundで出来るのでは
* keypress eventが他のextensionとバッティングするのなんとかしたい（主にvimium
    * vimiumの一機能として実装してプルリクとかもありっちゃあり
    * keypress eventをkeydownにしたらましになりそう！shift押してるかどうかとかハンドリングする必要があってめんどうだけれど。
* manifest.jsonのupdate
* underscore.js無駄に使ったのやめる
* faviconでキー表示機能
* originalTitleのところ、最初に取得したtitleから変わってる可能性あるからなんとかする
* alphabet, unbindデータを一括管理
* 0-9を追加
* 2桁で移動
* prefixキーの変更
* bindedなキーの設定
* タブの名前変更ロジック
* 修飾キー対応
* tabが切り替わったらreset(moveしたら、というのがなくなる)
* moveするときevent.stopPropagationする
* 直前のタブにさっと移動できる(prefixkey 2連打とか)
