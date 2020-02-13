set -x Z_DATA $HOME/.local/share/z/data
set -x Z_DATA_DIR $HOME/.local/share/z
set -x Z_EXCLUDE $HOME
set -x GPG_TTY (tty)

set -x GO111MODULE on

set -x LESS '-g -i -M -R -S -W -z-4 -x4'
set -x PAGER less

set XDG_CONFIG_HOME $HOME/.config

source ~/.config/fish/path.fish
source ~/.config/fish/prompt.fish
source ~/.config/fish/alias.fish
source ~/.config/fish/keybindings.fish

if which lesspipe.sh >/dev/null
  set -x LESSOPEN '| /usr/bin/env lesspipe.sh %s 2>&-'
end

anyenv init - fish | source

if status --is-interactive
  nodenv init - | source
end

if not functions -q fisher
  set -q XDG_CONFIG_HOME; or set XDG_CONFIG_HOME ~/.config
  curl https://git.io/fisher --create-dirs -sLo $XDG_CONFIG_HOME/fish/functions/fisher.fish
  fish -c fisher
end

direnv hook fish | source
