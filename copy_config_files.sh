# Zsh
ln -sf "$REPO_DIR/zshrc" ~/.zshrc

# Tmux
ln -sf "$REPO_DIR/tmux-config" ~/.tmux.conf

# Ghostty
mkdir -p ~/.config/ghostty
ln -sf "$REPO_DIR/ghostty-config" ~/.config/ghostty/config

# Git
ln -sf "$REPO_DIR/gitconfig" ~/.gitconfig

# Neovim
touch ~/.config/nvim/init.lua
ln -sf "$REPO_DIR/nvim-config" ~/.config/nvim/init.lua
