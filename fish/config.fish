source ~/.config/fish/path.fish
source ~/.config/fish/prompt.fish
source ~/.config/fish/alias.fish
source ~/.config/fish/keybindings.fish

# The next line updates PATH for the Google Cloud SDK.
if [ -f '~/.config/google-cloud-sdk/path.fish.inc' ]
  if type source > /dev/null;
    source '~/.config/google-cloud-sdk/path.fish.inc'
  else
    . '~/.config/google-cloud-sdk/path.fish.inc'
  end
end

set -U EDITOR vim
