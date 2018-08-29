set -gx PATH /usr/local/bin $PATH # Homebrew
set -gx PATH $HOME/.nodebrew/current/bin $PATH # nodebrew
set -gx PATH $PATH /usr/local/share/git-core/contrib/diff-highlight # for git diff-highlight
set -gx PATH $PATH ~/.cargo/bin
set -gx LLVM_CONFIG /usr/local/Cellar/llvm/5.0.0/bin/llvm-config
set -gx GOPATH ~/dev
set -gx PATH $PATH $GOPATH/bin
set -gx PATH $PATH $PATH ~/Library/Android/sdk/platform-tools
set -g fish_user_paths "/usr/local/opt/llvm/bin" $fish_user_paths
set -gx PATH $PATH '/Applications/Visual Studio Code.app/Contents/Resources/app/bin'
