# .config

## install

```
$ curl -s https://raw.githubusercontent.com/karszawa/.config/master/setup.sh | bash -s
```

## export

```
$ bash -s export.sh
```

## TODO

- ディレクトリ移動系のキーバインドを足す
  - `ctrl+@` で親ディレクトリ
  - `ctrl+,` で戻るとか
- anyenv 化
  - インストールはできたけど source (anyenv init -)がバグる
- https://rcmdnk.com/blog/2015/03/22/computer-mac/
  - defaults write -g InitialKeyRepeat -int 12
- gitignore fish/fish_variables
