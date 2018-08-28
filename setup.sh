cd ~

/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

brew install hub

hub clone --depth=1 https://github.com/karszawa/.config

brew bundle install --file=~/.config/Brewfile

# set up fish

# set up vim

# set up vscode
