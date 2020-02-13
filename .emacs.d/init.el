(defun startup()
  (define-key key-translation-map [?\C-h] [?\C-?])

  ;; 上部メニューバーを非表示
  (menu-bar-mode -1)

  ;; stop creating backup~ files
  (setq-default make-backup-files nil)

  ;; stop creating #autosave# files
  (setq-default auto-save-default nil)

  ;; ツールバーを非表示
  (if (eq window-system 'ns)
      (tool-bar-mode -1))

  ;; 起動中のEmacsの外からファイルを変更されたとき、
  ;; バッファを自動で再読み込む
  ;; http://shibayu36.hatenablog.com/entry/2012/12/29/001418
  (global-auto-revert-mode 1)

  ;; シンボリックリンクを追う
  (setq-default vc-follow-symlinks t)

  ;; 自動改行無効化
  (setq-default truncate-partial-width-windows t)
  (setq-default truncate-lines t)

  ;; 起動時画面を消す
  (setq-default inhibit-startup-message t)

  ;; 対応するカッコをハイライト
  (show-paren-mode t)

  ;; タブ文字ではなくスペースを使う
  (setq-default indent-tabs-mode nil)

  ;; タブ幅をスペース2つ分にする
  (setq-default tab-width 2)

  (setq tab-always-indent nil)
)

(add-hook 'terminal-init-xterm-hook #'startup)
