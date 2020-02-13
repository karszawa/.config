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

if not functions -q fisher
  set -q XDG_CONFIG_HOME; or set XDG_CONFIG_HOME ~/.config
  curl https://git.io/fisher --create-dirs -sLo $XDG_CONFIG_HOME/fish/functions/fisher.fish
  fish -c fisher
end

if type -q lesspipe.sh
  set -x LESSOPEN '| /usr/bin/env lesspipe.sh %s 2>&-'
end

if not type -q anyenv
  echo "# Could not find anyenv. Will setup:"
  anyenv install --init
end

anyenv init - fish | source

if not type -q nodenv
  echo "# Could not find nodenv. Will setup:"
  anyenv install nodenv
end

nodenv init - | source

if type -q direnv
  direnv hook fish | source
end

if not [ -d (nodenv root)/plugins ]
  echo "# There is no configuration about nodenv-default-packages. Setting up now:"
  mkdir -p (nodenv root)/plugins
  git clone https://github.com/nodenv/nodenv-default-packages.git (nodenv root)/plugins/nodenv-default-packages
  ln -sf ~/.config/default-packages (nodenv root)/default-packages
  echo "# Finished"
end
