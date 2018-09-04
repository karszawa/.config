#!/bin/bash

# docker

declare failed_commands=""
function trace {
  echo -e "\033[1m$@\033[0m" >&2

  if "$@"; then
  else
    failed_commands+="$@\n"
  fi
}

declare step_counter=1
function echo_step {
  echo -e "\033[34m\033[1mSTEP #$step_counter: $1\033[0m"
  let ++step_counter
}

function enter_to_continue {
  read -p "PRESS ENTER TO CONTINUE:"
}

cd ~

echo_step 'homebrew'

trace /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

echo_step 'git'

brew install hub

trace ln -s ~/.config/.gitconfig ~/.gitconfig
trace ln -s ~/.config/.gitattributes ~/.gitattributes
trace ln -s ~/.config/.gitignore-global ~/.gitignore-global

echo -e "Host *\n  UseKeychain yes\n  AddKeysToAgent yes\n  IdentityFile ~/.ssh/id_rsa" >> ~/.ssh/config

trace ssh-keygen -t rsa -b 4096 -C "siqvare@gmail.com"
echo 'Visit https://github.com/settings/ssh/new to register new key'
cat ~/.ssh/id_rsa.pub
enter_to_continue

echo_step 'brewfile'

trace hub clone --depth=1 https://github.com/karszawa/.config

trace brew bundle install --file=~/.config/Brewfile

echo_step 'pry'

trace ln -s ~/.config/pry/.pryrc ~/.pryrc
trace cat ~/.config/pry/gems.list | xargs -L1 code --install-extension

echo_step 'fish'

trace curl -Lo ~/.config/fish/functions/fisher.fish --create-dirs https://git.io/fisher

trace fisher

echo_step 'vim'

trace rm ~/.vim
trace ln -s ~/.config/.vim/ ~/.vim

trace mkdir -p ~/.vim/autoload ~/.vim/bundle 
trace curl -LSso ~/.vim/autoload/pathogen.vim https://tpo.pe/pathogen.vim

trace git clone --depth=1 https://github.com/vim-airline/vim-airline ~/.vim/bundle/vim-airline

echo_step 'Visual Studio Code'

trace rm ~/Library/Application\ Support/Code/User/settings.json
trace ln -s ~/.config/code/settings.json ~/Library/Application\ Support/Code/User/settings.json
trace rm ~/Library/Application\ Support/Code/User/keybindings.json
trace ln -s ~/.config/code/keybindings.json ~/Library/Application\ Support/Code/User/keybindings.json
trace rm ~/Library/Application\ Support/Code/User/locale.json
trace ln -s ~/.config/code/locale.json ~/Library/Application\ Support/Code/User/locale.json

trace cat ~/.config/.vscode/extensions.list | xargs -L1  /Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin/code--install-extension

echo_step 'google-cloud-sdk'

trace curl https://sdk.cloud.google.com | bash --install-dir=~/.google

trace chsh -s /usr/local/bin/fish
chsh -s /bin/zsh

echo_step 'hushlogin'

trace touch ~/.hushlogin

echo_step 'iTerm2'

echo 'Open iTerm2 and check "Load preferences from a custom folder or URL" then fill text box with "~/.config/iterm2"'

enter_to_continue

if [ failed_commands == "" ]; then
  echo 'DONE'
else
  echo "\033[31mFailed to execute following commands:\033[0m"
  echo -e failed_commands
fi

