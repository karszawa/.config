function move_up
    cd ..
end

function move_back
    cd -
end

function fish_user_key_bindings
    bind \cr peco_select_history
    bind \cg peco_change_directory
end

# fish_user_key_bindings
