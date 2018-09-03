if [ -f '~/dev' ]
  mkdir '~/dev'
end

set -gx GOPATH ~/dev

set paths \
  $GOPATH/bin \
  ~/.cargo/bin \
  '/usr/local/share/git-core/contrib/diff-highlight' \
  '/Applications/Visual Studio Code.app/Contents/Resources/app/bin' \

for path in $paths
  if not [ -f $path ]
    set -gx fish_user_paths $path $fish_user_paths
  end
end
