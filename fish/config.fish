source ~/.config/fish/path.fish
source ~/.config/fish/prompt.fish
source ~/.config/fish/alias.fish
source ~/.config/fish/keybindings.fish

set -U Z_DATA $HOME/\x2elocal/share/z/data
set -U Z_DATA_DIR $HOME/\x2elocal/share/z
set -U Z_EXCLUDE $HOME

export GPG_TTY=(tty)
export GO111MODULE=on

# https://qiita.com/delphinus/items/b04752bb5b64e6cc4ea9
export LESS='-g -i -M -R -S -W -z-4 -x4'
export PAGER=less

if which lesspipe.sh > /dev/null
  export LESSOPEN='| /usr/bin/env lesspipe.sh %s 2>&-'
end

# set -x NDENV_ROOT $HOME/.anyenv/envs/ndenv
# set -x PATH $HOME/.anyenv/envs/ndenv/bin $PATH
# set -x PATH $NDENV_ROOT/shims $PATH
