function fish_prompt
		set_color 636363; echo -n '['(date "+%H:%M:%S")'] '
		set_color ff1744; echo -n (whoami)'@'(scutil --get ComputerName)' '
		set_color 00e676; echo -n (prompt_pwd)

		if git rev-parse 2> /dev/null
        set -l git_branch_name (git branch ^/dev/null | sed -n '/\* /s///p')
        set_color 2979ff; echo -n " ($git_branch_name)"
    end

		echo ""

		set_color white; echo -n '$ '
end

function fish_right_prompt
end

function fish_greeting
end
