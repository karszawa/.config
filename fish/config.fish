source ~/.config/fish/path.fish
source ~/.config/fish/prompt.fish
source ~/.config/fish/alias.fish
source ~/.config/fish/keybindings.fish

set -x Z_DATA $HOME/.local/share/z/data
set -x Z_DATA_DIR $HOME/.local/share/z
set -x Z_EXCLUDE $HOME
set -x GPG_TTY (tty)

# export GPG_TTY=(tty)
set -x GO111MODULE on

# https://qiita.com/delphinus/items/b04752bb5b64e6cc4ea9
set -x LESS '-g -i -M -R -S -W -z-4 -x4'
set -x PAGER less

if which lesspipe.sh >/dev/null
    set -x LESSOPEN '| /usr/bin/env lesspipe.sh %s 2>&-'
end

anyenv init - fish | source

if status --is-interactive
    source (nodenv init -|psub)
end

# Doesn't exist
# source /usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/completion.fish.inc
