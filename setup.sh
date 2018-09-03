# apple id
# modify Brefile
# docker
# zshrc
# git-highlight
# .gitconfig

cd ~

echo '# SET UP homebrew'

/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

brew install hub

hub clone --depth=1 https://github.com/karszawa/.config

brew bundle install --file=~/.config/Brewfile

echo '# SET UP fish'

curl -Lo ~/.config/fish/functions/fisher.fish --create-dirs https://git.io/fisher

fisher

echo '# SET UP vim'

ln -s .vim/ ../.vim

mkdir -p ~/.vim/autoload ~/.vim/bundle && \
curl -LSso ~/.vim/autoload/pathogen.vim https://tpo.pe/pathogen.vim

git clone --depth=1 https://github.com/vim-airline/vim-airline ~/.vim/bundle/vim-airline

echo '# SET UP iTerm2'

echo 'Open iTerm2 and check "Load preferences from a custom folder or URL" then fill text box with "~/.config/iterm2"'

echo '# SET UP visual-studio-code'

ln -s ~/.config/code/settings.json ~/Library/Application\ Support/Code/User/settings.json
ln -s ~/.config/code/keybindings.json ~/Library/Application\ Support/Code/User/keybindings.json
ln -s ~/.config/code/locale.json ~/Library/Application\ Support/Code/User/locale.json

cat ~/.config/.vscode/extensions.list | xargs -L1 code --install-extension

echo '# SET UP google-cloud-sdk'

curl https://sdk.cloud.google.com | bash

chsh -s /usr/local/bin/fish
