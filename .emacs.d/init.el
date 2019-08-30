(defun startup_func()
  (define-key key-translation-map [?\C-h] [?\C-?])

  ;; 上部メニューバーを非表示
  (menu-bar-mode -1)

  ;; stop creating backup~ files
  (setq make-backup-files nil)

  ;; stop creating #autosave# files
  (setq auto-save-default nil)

  ;; ツールバーを非表示
  (if (eq window-system 'ns)
      (tool-bar-mode -1))

  ;; 起動中のEmacsの外からファイルを変更されたとき、
  ;; バッファを自動で再読み込む
  ;; http://shibayu36.hatenablog.com/entry/2012/12/29/001418
  (global-auto-revert-mode 1)

  ;; シンボリックリンクを追う
  (setq vc-follow-symlinks t)

  ;; 自動改行無効化
  (setq-default truncate-partial-width-windows t)
  (setq-default truncate-lines t)

  ;; 起動時画面を消す
  (setq inhibit-startup-message t)

  ;; 対応するカッコをハイライト
  (show-paren-mode t)

  ;; タブ幅を2に
  (setq default-tab-width 2)
)

(add-hook 'terminal-init-xterm-hook #'startup_func)
