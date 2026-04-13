#!/bin/bash

# Kolory do logów
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🐧 Rozpoczynam konfigurację środowiska Fedora...${NC}"

# 1. Aktualizacja systemu
echo -e "${GREEN}Aktualizacja systemu i instalacja podstawowych narzędzi...${NC}"
sudo dnf upgrade --refresh -y

# 2. Włączenie wsparcia dla Flatpak i Flathub
echo -e "${GREEN}Konfiguracja Flathub...${NC}"
sudo flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo

# 3. Instalacja podstawowych narzędzi systemowych i terminalowych
echo -e "${GREEN}Instalacja Zsh, Tmux, Git, curl i narzędzi CLI...${NC}"
sudo dnf install -y \
    zsh tmux curl git wget util-linux-user \
    neovim eza bat fzf zoxide \
    nodejs npm \
    gimp evince eog \
    adw-gtk3-theme papirus-icon-theme --skip-unavailable  # FEDORA 42 has problems with EZA - no active mainrainer so it was removed from official repos

# I notice it's available via cargo!
cargo install eza

# bat in anavilable also :/
git clone https://github.com/fdellwing/zsh-bat.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-bat

# Flamshot fix for Wayland + Fedora 42+ - DONT USE FLAMESHOT :) it sucks

# 4. Dodanie repozytoriów Copr dla specyficznych narzędzi (Neovide, Lazygit)
echo -e "${GREEN}Aktywacja repozytoriów Copr...${NC}"
sudo dnf copr enable -y atim/lazygit
# sudo dnf copr enable -y atim/neovide # FEDORA 42 has problems
sudo dnf install -y lazygit neovide --skip-unavailable

# instalacja neovide z cargo
sudo dnf install -y rust cargo cmake gcc gcc-c++ freetype-devel fontconfig-devel
cargo install --git https://github.com/neovide/neovide

# Ghostty terminal (aktualnie najpopularniejsze repozytorium społecznościowe dla Fedory)
sudo dnf copr enable -y pgdev/ghostty || echo "Ghostty Copr może być niedostępny, sprawdź manualnie."
sudo dnf install -y ghostty || echo "Pomięto Ghostty - zainstaluj ze źródeł jeśli niedostępne."

# 5. Instalacja Docker'a (oficjalne repozytorium Fedora)
echo -e "${GREEN}Instalacja Docker'a...${NC}"
sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# 6. Instalacja aplikacji programistycznych i użytkowych via Flatpak
echo -e "${GREEN}Instalacja aplikacji z Flathub (Zed, DBeaver, Bruno, itd.)...${NC}"
flatpak install -y flathub dev.zed.Zed \
    io.dbeaver.DBeaverCommunity \
    com.usebruno.Bruno \
    com.jgraph.drawio.desktop \
    org.videolan.VLC \
    com.bitwarden.desktop \
    rt.notion_app.Notion

# 7. Instalacja gtop (Node.js)
echo -e "${GREEN}Instalacja gtop...${NC}"
sudo npm install -g gtop

# 8. Konfiguracja Zsh & Oh-My-Zsh
echo -e "${GREEN}Konfiguracja powłoki Zsh...${NC}"
if [ ! -d "$HOME/.oh-my-zsh" ]; then
    RUNZSH=no CHSH=no sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
fi

# Pluginy do Zsh
ZSH_CUSTOM=${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}
[ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ] && git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM}/plugins/zsh-autosuggestions
[ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ] && git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM}/plugins/zsh-syntax-highlighting
[ ! -d "$ZSH_CUSTOM/plugins/fzf-tab" ] && git clone https://github.com/Aloxaf/fzf-tab ${ZSH_CUSTOM}/plugins/fzf-tab

# 9. Instalacja Starship
echo -e "${GREEN}Instalacja Starship prompt...${NC}"
curl -sS https://starship.rs/install.sh | sh -s -- -y

# 10. Konfiguracja Tmux (TPM)
echo -e "${GREEN}Konfiguracja TPM dla Tmux...${NC}"
[ ! -d "$HOME/.tmux/plugins/tpm" ] && git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm

# 11. Zmiana parametru Swappiness
echo -e "${GREEN}Ustawianie vm.swappiness=10...${NC}"
echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-custom-swappiness.conf
sudo sysctl -p /etc/sysctl.d/99-custom-swappiness.conf

# 12. Pano (Menedżer schowka - zależności)
echo -e "${GREEN}Instalowanie zależności dla rozszerzenia GNOME Pano...${NC}"
sudo dnf install -y libgda libgda-sqlite gsnd

# 13. OpenSnitch (Alternatywa dla Little Snitch na Linuksa)
echo -e "${GREEN}Instalowanie OpenSnitch (Linuksowy odpowiednik Little Snitch)...${NC}"
sudo dnf install -y opensnitch opensnitch-ui
sudo systemctl enable --now opensnitch

echo -e "${BLUE}🎉 Instalacja zakończona!${NC}"
echo -e "Aby dokończyć setup, wykonaj następujące kroki:"
echo -e "1. Zmień domyślną powłokę wpisując: ${GREEN}chsh -s \$(which zsh)${NC}"
echo -e "2. Przenieś swoje pliki konfiguracyjne (.zshrc, ghostty-config, tmux-config) z własnego repozytorium do odpowiednich folderów."
echo -e "3. Włącz rozszerzenia GNOME (Just Perfection, Blur my Shell, Pano) za pomocą aplikacji GNOME Extensions."
echo -e "4. Uruchom tmux i wciśnij ${GREEN}PREFIX + I${NC}, aby zainstalować wtyczki TPM."
echo -e "5. ${GREEN}gsettings set org.gnome.desktop.interface icon-theme 'Papirus'${NC} aby uruchomić ikony papirus"
echo -e "5. Wyloguj się i zaloguj ponownie (lub zrestartuj komputer), aby zastosować zmiany w Dockerze i powłoce."
