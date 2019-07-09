function move_up
    cd ..
end

function move_back
    cd -
end

function fish_user_key_bindings
    # peco
    bind \cr peco_select_history
    bind \cg peco_change_directory
    # bind \c@ move_up
    # bind \c, move_back
end

# fish_user_key_bindings
