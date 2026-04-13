export ZSH="$HOME/.oh-my-zsh"

plugins=(git zsh-autosuggestions zsh-syntax-highlighting zsh-bat fzf zoxide fzf-tab)

# Preferred editor for local and remote sessions
export EDITOR='nvim'

# my universal aliases

alias open="xdg-open"
alias cargofmt="cargo fix --allow-dirty && cargo clippy --fix --tests --allow-dirty && cargo fmt && cargo machete"

# EZA - ls replacement
alias ls='eza --icons'
alias ll='eza -lh --icons --grid --group-directories-first'
alias la='eza -lah --icons --group-directories-first'
alias lt='eza --tree --icons'

# BAT - cat replacement
alias cat='bat'

# FZF - fuzzy finder Ctrl+T to find files, Alt+C to find directories, Ctrl+R to find history
if [ -f /usr/share/doc/fzf/examples/key-bindings.zsh ]; then
  source /usr/share/doc/fzf/examples/key-bindings.zsh
elif [ -f /usr/share/fzf/key-bindings.zsh ]; then
  source /usr/share/fzf/key-bindings.zsh
fi

if [ -f /usr/share/doc/fzf/examples/completion.zsh ]; then
  source /usr/share/doc/fzf/examples/completion.zsh
elif [ -f /usr/share/fzf/completion.zsh ]; then
  source /usr/share/fzf/completion.zsh
fi

alias fzf='fzf --preview ""'

# Wyłącz standardowe menu wyboru (używamy fzf)
zstyle ':completion:*' menu no

# Podgląd zawartości przy uzupełnianiu komend (np. cd, ls)
# Dla katalogów używamy eza, dla plików batcat
zstyle ':fzf-tab:complete:cd:*' fzf-preview 'eza -1 --color=always $realpath'
zstyle ':fzf-tab:complete:ls:*' fzf-preview 'batcat --color=always --style=numbers $realpath'

# Obsługa kolorów w menu
zstyle ':fzf-tab:*' fzf-flags --color=fg:1,bg:0,hl:3,fg+:2,bg+:0,hl+:3

# DUO BAT + FZF looking great!
export FZF_CTRL_T_OPTS="--preview 'batcat --color=always --style=numbers --line-range=:500 {}'"
export FZF_ALT_C_OPTS="--preview 'eza --tree --color=always {} | head -200'"
export FZF_DEFAULT_OPTS="--height 40% --layout=reverse --border --color=header:#ed8796,info:#c6a0f6,pointer:#f4dbd6,marker:#f4dbd6,fg:#cad3f5,bg:#24273a,hl:#ed8796"

# Zoxide - cd replacement
eval "$(zoxide init zsh)"
alias cd='z'

# lazygit - git client
alias lg='lazygit'

# PATH modification
export PATH=$PATH:$HOME/.local/bin/
export PATH=$PATH:$HOME/.cargo/bin/
# Only for my debian setup - had problems heh
export PATH=$PATH:/opt/st/stm32cubeide_1.19.0/plugins/com.st.stm32cube.ide.mcu.externaltools.gnu-tools-for-stm32.13.3.rel1.linux64_1.0.0.202410170706/tools/bin/

source $ZSH/oh-my-zsh.sh
