#!/bin/bash

# --- KONFIGURACJA KOLORÓW ---
 GREEN='\033[0;32m'
 BLUE='\033[0;34m'
 NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Rozpoczynam automatyczną konfigurację Twojego setupu...${NC}"

# 1. Aktualizacja systemu
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git wget build-essential gpg fontconfig tmux zsh

# 2. Instalacja nowoczesnych narzędzi CLI
echo -e "${GREEN}📦 Instalacja modern CLI (eza, bat, fzf, zoxide, btop)...${NC}"

# eza (następca ls)
sudo mkdir -p /etc/apt/keyrings
wget -qO- https://raw.githubusercontent.com/eza-community/eza/main/deb.asc | sudo gpg --dearmor -o /etc/apt/keyrings/gierens.gpg
echo "deb [signed-by=/etc/apt/keyrings/gierens.gpg] http://deb.gierens.de stable main" | sudo tee /etc/apt/sources.list.d/gierens.list
sudo apt update && sudo apt install -y eza

# bat (na Debianie instalowany jako 'batcat')
sudo apt install -y bat
mkdir -p ~/.local/bin
ln -sf /usr/bin/batcat ~/.local/bin/bat

# fzf
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install --all

# zoxide
curl -sS https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | bash

# btop
sudo apt install -y btop

# Starship prompt
curl -sS https://starship.rs/install.sh | sh -s -- -y

# 3. Konfiguracja ZSH i Oh-My-Zsh
echo -e "${GREEN}🐚 Konfiguracja Zsh i wtyczek...${NC}"
if [ ! -d "$HOME/.oh-my-zsh" ]; then
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
fi

# Wtyczki do Zsh
ZSH_CUSTOM=${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM}/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM}/plugins/zsh-syntax-highlighting

# Tworzenie .zshrc
cat <<EOF > ~/.zshrc
export PATH=\$HOME/.local/bin:\$PATH
export ZSH="\$HOME/.oh-my-zsh"

plugins=(git zsh-autosuggestions zsh-syntax-highlighting zoxide)

source \$ZSH/oh-my-zsh.sh

# Aliasy
alias ls='eza --icons --group-directories-first'
alias ll='eza -l --icons --group-directories-first'
alias cat='bat'

# Inicjalizacja narzędzi
eval "\$(starship init zsh)"
eval "\$(zoxide init zsh)"
EOF

# 4. Konfiguracja Tmux (TPM)
echo -e "${GREEN}🪟 Konfiguracja Tmux...${NC}"
if [ ! -d "$HOME/.tmux/plugins/tpm" ]; then
    git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
fi

cat <<EOF > ~/.tmux.conf
# Enable mouse
set -g mouse on

# Plugins
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'catppuccin/tmux'

# Initialize TMUX plugin manager
run '~/.tmux/plugins/tpm/tpm'
EOF

echo -e "${BLUE}✅ Setup zakończony! Zrestartuj terminal.${NC}"
echo -e "Aby zainstalować wtyczki Tmux, otwórz go i naciśnij: CTRL+b a potem I (duże i)."
