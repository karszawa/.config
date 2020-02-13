if [ -f '~/dev' ]
  mkdir '~/dev'
end

set -x GOPATH ~/dev
set -x ANYENV_ROOT $HOME/.anyenv

set -x PATH $GOPATH/bin $PATH
set -x PATH $HOME/.cargo/bin $PATH
set -x PATH '/usr/local/share/git-core/contrib/diff-highlight' $PATH
set -x PATH $HOME/bin $PATH
set -x PATH (npm root -g) $PATH
set -x PATH $HOME/.config/scripts $PATH
set -x PATH /usr/local/sbin $PATH

set GOOGLE_CLOUD_SDK_PATH_INC /usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/path.fish.inc

if [ -f $GOOGLE_CLOUD_SDK_PATH_INC ]
    source $GOOGLE_CLOUD_SDK_PATH_INC
end
