source ~/.config/fish/path.fish
source ~/.config/fish/prompt.fish
source ~/.config/fish/alias.fish
source ~/.config/fish/keybindings.fish

# The next line updates PATH for the Google Cloud SDK.
if [ -f '/Users/hk/.config/google-cloud-sdk/path.fish.inc' ]; if type source > /dev/null; source '/Users/hk/.config/google-cloud-sdk/path.fish.inc'; else; . '/Users/hk/.config/google-cloud-sdk/path.fish.inc'; end; end
