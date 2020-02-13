#!/bin/bash -e

set -o pipefail

if [ -z "$CI" ] then
  CONFIG_PATH="$(pwd)"
else
  CONFIG_PATH=$HOME/.config
fi

declare failed_commands=""
function trace {
  echo -e "\033[1m$@\033[0m" >&2

  if "$@"; then
    :
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

echo_step 'copy default files'

if [ ! -f ~/.ssh ]; then
  mkdir ~/.ssh
fi

trace cat $CONFIG_PATH/defaults/ssh_config >> ~/.ssh/config

echo_step 'link'

trace ln -sf ~/.config/.bash_profile ~/.bash_profile
trace ln -sf ~/.config/.gitconfig ~/.gitconfig
trace ln -sf ~/.config/.gitattributes ~/.gitattributes
trace ln -sf ~/.config/.gitignore-global ~/.gitignore-global
trace ln -sf ~/Documents/Sync/keys/id_rsa .ssh/id_rsa
trace ln -sf ~/Documents/Sync/keys/id_rsa.pub .ssh/id_rsa.pub

echo_step 'xcodebuild'

trace sudo xcodebuild -license accept

echo_step 'homebrew'

trace /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

echo_step 'brewfile'

trace brew bundle --file=$CONFIG_PATH/Brewfile

if [ -z "$CI" ]; then
  echo_step 'clone .config'

  trace git clone --depth=1 https://github.com/karszawa/.config
fi

echo_step 'Touch ID'

# sudoでTouchIDが使えるようにする → https://qiita.com/kawaz/items/0593163c1c5538a34f6f
curl -sL https://gist.github.com/kawaz/d95fb3b547351e01f0f3f99783180b9f/raw/install-pam_tid-and-pam_reattach.sh | bash

echo_step 'change shell to fish'

trace sudo echo /usr/local/bin/fish >> /etc/shells
trace sudo chsh -s /usr/local/bin/fish

echo_step 'Visual Studio Code'

echo "Install Settings Sync via https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync"
echo "and use this gist id 3b3e44582a7703adcbf870e8d1325c37"

echo_step 'Alfread'

echo 'Open Alfread prefereces and Open Advanced > Set preferences folder then set target folder to ~/Documents/Sync'

enter_to_continue

echo_step 'iTerm2'

echo 'Open iTerm2 and check "Load preferences from a custom folder or URL" then fill text box with "~/Documents/Sync"'

enter_to_continue

if [ failed_commands == "" ]; then
  echo 'DONE'
else
  echo "\033[31mFailed to execute following commands:\033[0m"
  echo -e failed_commands
fi

