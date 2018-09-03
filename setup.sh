#!/bin/bash

# docker
# .gitconfig

function trace {
  echo -e "\033[1m$@\033[0m" >&2
  "$@"
}

declare step_counter=1
function echo_step {
  echo -e "\033[34m\033[1mSTEP #$step_counter: $1\033[0m"
  let ++step_counter
}

cd ~

echo_step 'homebrew'

trace /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

brew install hub

trace hub clone --depth=1 https://github.com/karszawa/.config

trace brew bundle install --file=~/.config/Brewfile

echo_step 'git'

trace ln -s ~/.config/.gitconfig ~/.gitconfig
trace ln -s ~/.config/.gitattributes ~/.gitattributes
trace ln -s ~/.config/.gitignore-global ~/.gitignore-global

echo_step 'fish'

trace curl -Lo ~/.config/fish/functions/fisher.fish --create-dirs https://git.io/fisher

trace fisher

echo_step 'vim'

trace ln -s .vim/ ../.vim

trace mkdir -p ~/.vim/autoload ~/.vim/bundle && \
trace curl -LSso ~/.vim/autoload/pathogen.vim https://tpo.pe/pathogen.vim

trace git clone --depth=1 https://github.com/vim-airline/vim-airline ~/.vim/bundle/vim-airline

echo_step 'Visual Studio Code'

trace ln -s ~/.config/code/settings.json ~/Library/Application\ Support/Code/User/settings.json
trace ln -s ~/.config/code/keybindings.json ~/Library/Application\ Support/Code/User/keybindings.json
trace ln -s ~/.config/code/locale.json ~/Library/Application\ Support/Code/User/locale.json

trace cat ~/.config/.vscode/extensions.list | xargs -L1 code --install-extension

echo_step 'google-cloud-sdk'

trace curl https://sdk.cloud.google.com | bash --install-dir=~/.google

trace chsh -s /usr/local/bin/fish

echo_step 'iTerm2'

echo 'Open iTerm2 and check "Load preferences from a custom folder or URL" then fill text box with "~/.config/iterm2"'

fish

echo 'DONE'
