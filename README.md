# 🐧 Linux Setup

Repository containing my environment configuration.

-----

## 🖥️ System & Desktop Environment

  - **OS:** [Debian GNU/Linux](https://www.debian.org/) (Stable/Testing)
  - **DE:** [GNOME](https://www.gnome.org/)
  - **Theme:** Adw-gtk3 + Papirus Icons

### GNOME Extensions

  - **Just Perfection:** Minimalism and removal of unnecessary UI elements.
  - **Blur my Shell:** Aesthetic blur for the panel and overview.

-----

## 🐚 Terminal Stack

I use [Ghostty](https://ghostty.org/) - configuration in the `ghostty-config` file. My shell is **Zsh** managed by **Oh-My-Zsh** with the **Starship** theme.
I also use **Tmux** for session management and terminal splitting.

My `.zshrc` file is located in `zshrc`.

### Core tools and their replacements:

| Tool | Replacement for | Description |
| :--- | :--- | :--- |
| `eza` | `ls` | Modern file listing with colors and icons. |
| `bat` | `cat` | File viewing with syntax highlighting. |
| `fzf` | `CTRL+R` | Fuzzy searching through history and files. |
| `zoxide` | `cd` | Smarter directory navigation. |
| `gtop` | `top` | Interactive system resource monitor. |

### Zsh Plugins

  - `zsh-autosuggestions` - Suggestions based on history.
  - `zsh-syntax-highlighting` - Real-time command highlighting.
  - `fzf-tab` - Fzf instead of the standard tab-completion menu.

### 🪟 Tmux Configuration

  - **Plugin Manager:** [TPM](https://github.com/tmux-plugins/tpm)
  - **Main Plugins:**
      - `tmux-resurrect`: Restore sessions after a restart.
      - `tmux-continuum`: Automatic state saving.
      - `catppuccin/tmux`: Status bar theme.

Configuration in the `tmux-config` file.

-----

## My programming setup

  - [ZED](https://zed.dev/) - main IDE
  - [nvim](https://neovim.io/) - for quick edits in terminal
  - [Docker](https://www.docker.com/) - of course\!
  - [DBeaver](https://dbeaver.io/) - Free, open source DB client
  - [Bruno](https://www.usebruno.com) - Free, open source API client
  - [Lazy GIT](https://github.com/jesseduffield/lazygit) - great GUI for git\!
  - [Git custom configuration](https://www.google.com/search?q=https://github.com/KarolBorecki/setup/blob/master/.gitconfig)

-----

## Everyday tools

  - [Flameshot](https://flameshot.org/) - screenshots (but I use native app on Fedora 42+)
  - [Pano](https://extensions.gnome.org/extension/5278/pano/) - clipboard manager

## Everyday apps

  - [Brave](https://brave.com/download/) - web browser
  - [Notion](https://www.notion.so/) - note-taking app
  - [Thunderbird](https://www.thunderbird.net/en-US/thunderbird/all/) - email client - I also use custom styling for it :)
  - [GIMP](https://www.gimp.org/) - Image manipulation tool
  - [Draw.io](https://app.diagrams.net/) - Diagrams
  - [Bitwarden](https://bitwarden.com/) - password manager

## Default apps

  - [VLC](https://www.videolan.org/vlc/) - media player
  - [Evince](https://wiki.gnome.org/Apps/Evince) - PDF viewer
  - [Neovide](https://neovide.dev/) - Neovim GUI
  - [Eye of GNOME](https://wiki.gnome.org/Apps/EyeOfGnome) - image viewer

-----

## Interesting applications I use

  - [Little Snitch](https://obdev.at/products/littlesnitch-linux/index.html) - a desktop app allowing more control over network connections made by apps inside my system.

-----

### MacOS

  - [Raycast](https://www.raycast.com/) - Interesting shortcut app

-----

## Custom Thunderbird setup

1. Rnable `toolkit.legacyUserProfileCustomizations.stylesheets` in General -> Config Editor... (Scroll down)
2. Account settings -> Local Folders (check Local Directory path and open it)
3. Create directory `chrome` inside and `userChrome.css` file inside
4. Paste `thunderbird-style.css` inside
5. Install `Auto Profile Picture` by Noam Schmitt to have auto-profile pictures

-----

## 🌐 Custom Browser Dashboard (GitHub Pages)

Instead of the standard new tab page, I use my own dashboard hosted on **GitHub Pages**.

![image](img/dashboard1.png)


### Features:

  - **Quick Links:** - Shortcuts to the most frequently used tools.

  - **Status:** - Connected weather API and clock with custom suggestions for clothing - I always have trouble with that\!
  
  ![image](img/dashboard3.png)

  - **Apple Calendar Integration** - My calendar is quite specific, so I had to write my own script to fetch events and display them on the dashboard. I added custom coloring based on prefixes to better manage my time and tasks.

  ![image](img/dashboard2.png)
  
  - **Spotify Integration** - Displays the currently playing song and allows for playback control directly from the dashboard. Life doesn't exist without music.

  ![image](img/dashboard4.png)
  
  - **News Cards** - I combined several APIs to extract the most interesting content - I mainly scan subreddits to always have access to fresh information from 3 categories of interest: world (classic), programming, and space.

  - **Pomodoro:** - Simple timer, also useful for baking bread.

### How it works?

1.  The dashboard is built as a static HTML/CSS/JS page.
2.  Repository: `[karolborecki.github.io/dashboard/](https://karolborecki.github.io/setup/dashboard/index.html)`.
3.  Configured in the browser (For me it's Brave!) as the **Default New Tab**.

-----

## 🚀 Quick Install

For Debian:

```bash
./install_setup.sh
```

For Fedora (done on 42+):
```bash
./install_fedora.sh
```


-----

## Other important notices

  - I set swappiness to 10 because I have lots of RAM (32GB): `echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf`
  - I use SSD so I enable TRIM: `sudo systemctl enable fstrim.timer`
  - Usually I turn off animations, but not always: `gsettings set org.gnome.desktop.interface enable-animations false`
  - I use `preload` to optimize my workflow: `sudo apt install preload`
  - I use ZRAM: `sudo apt install zram-tools` && `sudo systemctl enable --now zramswap`
  - I disable services: `sudo systemctl disable NetworkManager-wait-online.service` `sudo systemctl mask plymouth-quit-wait.service`
