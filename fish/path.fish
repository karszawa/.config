if [ -f '~/dev' ]
    mkdir '~/dev'
end

set -x GOPATH ~/dev
set -x ANYENV_ROOT "$HOME/.anyenv"
set -x NDENV_ROOT $HOME/.anyenv/envs/ndenv

set -x PATH $GOPATH/bin $PATH
set -x PATH $HOME/.cargo/bin $PATH
set -x PATH $HOME/.anyenv/bin $PATH
set -x PATH $NDENV_ROOT/bin $PATH
set -x PATH $NDENV_ROOT/shims $PATH
set -x PATH '/usr/local/share/git-core/contrib/diff-highlight' $PATH

source "$HOME/.google/google-cloud-sdk/path.fish.inc"
