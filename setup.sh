# docker
# .gitconfig

declare step_counter=1
function echo_step {
  echo -e "\033[34m\033[1mSTEP #$step_counter: $1\033[0m"
  let ++step_counter
}

cd ~

echo_step 'homebrew'

/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

brew install hub

hub clone --depth=1 https://github.com/karszawa/.config

brew bundle install --file=~/.config/Brewfile

echo_step 'git'

ln -s ~/.config/.gitconfig ~/.gitconfig
ln -s ~/.config/.gitattributes ~/.gitattributes
ln -s ~/.config/.gitignore-global ~/.gitignore-global

echo_step 'fish'

curl -Lo ~/.config/fish/functions/fisher.fish --create-dirs https://git.io/fisher

fisher

echo_step 'vim'

ln -s .vim/ ../.vim

mkdir -p ~/.vim/autoload ~/.vim/bundle && \
curl -LSso ~/.vim/autoload/pathogen.vim https://tpo.pe/pathogen.vim

git clone --depth=1 https://github.com/vim-airline/vim-airline ~/.vim/bundle/vim-airline

echo_step 'Visual Studio Code'

ln -s ~/.config/code/settings.json ~/Library/Application\ Support/Code/User/settings.json
ln -s ~/.config/code/keybindings.json ~/Library/Application\ Support/Code/User/keybindings.json
ln -s ~/.config/code/locale.json ~/Library/Application\ Support/Code/User/locale.json

cat ~/.config/.vscode/extensions.list | xargs -L1 code --install-extension

echo_step 'google-cloud-sdk'

curl https://sdk.cloud.google.com | bash

chsh -s /usr/local/bin/fish

echo_step 'iTerm2'

echo 'Open iTerm2 and check "Load preferences from a custom folder or URL" then fill text box with "~/.config/iterm2"'

fish

echo 'DONE'
