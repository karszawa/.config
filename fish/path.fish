if [ -f '~/dev' ]
  mkdir '~/dev'
end

set -gx GOPATH ~/dev
set -gx ANYENV_ROOT "$HOME/.anyenv"

set paths \
  $GOPATH/bin \
  ~/.cargo/bin \
  '/usr/local/share/git-core/contrib/diff-highlight' \
  '/Applications/Visual Studio Code.app/Contents/Resources/app/bin' \
  '/usr/local/opt/php@7.1/bin' \
  $HOME/.anyenv/bin

for path in $paths
  if not [ -f $path ]
    set -gx fish_user_paths $path $fish_user_paths
  end
end

set -x NDENV_ROOT $HOME/.anyenv/envs/ndenv
set -x PATH $HOME/.anyenv/envs/ndenv/bin $PATH
set -x PATH $NDENV_ROOT/shims $PATH

source "$HOME/.google/google-cloud-sdk/path.fish.inc"
