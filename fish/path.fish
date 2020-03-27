if [ -f '~/dev' ]
  mkdir '~/dev'
end

set -x GOPATH ~/dev
set -x ANYENV_ROOT $HOME/.anyenv
set -x ANDROID_HOME $HOME/Library/Android/sdk
set -x JAVA_HOME /Applications/Android\ Studio.app/Contents/jre/jdk/Contents/Home

set -x PATH $GOPATH/bin $PATH
set -x PATH $HOME/.cargo/bin $PATH
set -x PATH '/usr/local/share/git-core/contrib/diff-highlight' $PATH
set -x PATH $HOME/bin $PATH
set -x PATH (npm root -g) $PATH
set -x PATH $HOME/.config/scripts $PATH
set -x PATH /usr/local/sbin $PATH
set -x PATH '/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin' $PATH
set -x PATH $ANDROID_HOME/emulator  $PATH
set -x PATH $ANDROID_HOME/tools $PATH
set -x PATH $ANDROID_HOME/tools/bin $PATH
set -x PATH $ANDROID_HOME/platform-tools $PATH
set -x PATH $JAVA_HOME/bin $PATH

set GOOGLE_CLOUD_SDK_PATH_INC /usr/local/Caskroom/google-cloud-sdk/latest/google-cloud-sdk/path.fish.inc

if [ -f $GOOGLE_CLOUD_SDK_PATH_INC ]
    source $GOOGLE_CLOUD_SDK_PATH_INC
end
