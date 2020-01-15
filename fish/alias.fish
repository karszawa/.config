alias a='git add'
alias a.='git add .'
alias b='git checkout -'
alias d='git diff -w --ignore-blank-lines --color-words'
alias dc='git diff --cached'
alias s='git status --short --branch'
alias l='git log --graph --decorate --oneline'
alias c='git commit -m'
alias cm='git commit'
alias ca='git commit --amend'
alias p='git push'
alias bs='git branch | peco | pbcopy'
alias emacs='emacsclient -c -a ""'
alias e=emacs
alias v='vim'
alias git='hub'
alias clang++='clang++ -std=c++0x'
alias c++='clang++'
alias ls='ls -alh'
alias rm='rmtrash'
alias sudo='sudo '
alias o='open'
alias j='autojump'
alias skim='open -a /Applications/Skim.app'
alias less='less -R'
alias t='tig'
alias code='/Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin/code'
alias peco='peco --initial-filter=Fuzzy'
alias scripts=list-scripts

function nah
  git reset --hard
  git clean -df
end

function get_parent_branch
  git show-branch | grep '*' | grep -v (git rev-parse --abbrev-ref HEAD) | head -1 | awk -F'[]~^[]' '{print $2}'
end
