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

echo_step 'xcodebuild'

trace sudo xcodebuild -license

echo_step 'homebrew'

trace /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

echo_step 'git'

brew install hub

cat ~/config/defaults/ssh_config >> ~/.ssh/config

trace ssh-keygen -t rsa -b 4096 -C "siqvare@gmail.com"
echo 'Visit https://github.com/settings/ssh/new to register new key'
cat ~/.ssh/id_rsa.pub
enter_to_continue

echo_step 'clone .config'

trace hub clone --depth=1 https://github.com/karszawa/.config

echo_step 'link'

trace ln -sf ~/.config/.bash_profile ~/.bash_profile
trace ln -sf ~/.config/.gitconfig ~/.gitconfig
trace ln -sf ~/.config/.gitattributes ~/.gitattributes
trace ln -sf ~/.config/.gitignore-global ~/.gitignore-global
trace ln -sf ~/.config/.vim/ ~/.vim
trace ln -sf ~/.config/.pryrc ~/.pryrc

echo_step 'Touch ID'

# sudoでTouchIDが使えるようにする → https://qiita.com/kawaz/items/0593163c1c5538a34f6f
curl -sL https://gist.github.com/kawaz/d95fb3b547351e01f0f3f99783180b9f/raw/install-pam_tid-and-pam_reattach.sh | bash

echo_step 'brewfile'

trace brew install mas
trace brew bundle install --file=~/.config/Brewfile
trace mas install 803453959

echo_step 'change shell to fish'

trace echo /usr/local/bin/fish >> /etc/shells
trace chsh -s /usr/local/bin/fish

echo_step 'fish'

trace curl https://git.io/fisher --create-dirs -sLo ~/.config/fish/functions/fisher.fish
trace fisher

echo_step 'anyenv'

trace anyenv install --init
trace anyenv install nodenv

echo_step 'vim'

trace mkdir -p ~/.vim/autoload ~/.vim/bundle
trace curl -LSso ~/.vim/autoload/pathogen.vim https://tpo.pe/pathogen.vim
trace git clone --depth=1 https://github.com/vim-airline/vim-airline ~/.vim/bundle/vim-airline

echo_step 'hushlogin'

trace touch ~/.hushlogin

echo_step 'pry'

trace cat ~/.config/gems.list | xargs -L1 gem install

echo_step 'google-cloud-sdk'

trace curl https://sdk.cloud.google.com | bash --install-dir=~/.google

echo_step 'Visual Studio Code'

echo "Install Settings Sync via https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync"
echo "and use this gist id 3b3e44582a7703adcbf870e8d1325c37"

echo_step 'Alfread'

echo 'Open Alfread prefereces and Open Advanced > Set preferences folder then set target folder to ~/.config'

enter_to_continue

echo_step 'iTerm2'

echo 'Open iTerm2 and check "Load preferences from a custom folder or URL" then fill text box with "~/.config"'

enter_to_continue

if [ failed_commands == "" ]; then
  echo 'DONE'
else
  echo "\033[31mFailed to execute following commands:\033[0m"
  echo -e failed_commands
fi

