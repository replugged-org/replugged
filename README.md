# Replugged

> **Warning**  
> This branch of Replugged is still in development. It is not complete and will likely cause
> issues.  
> **No support will be provided.**

## Installation

> **Note**  
> In the future, there will be a GUI installer for general users. For now, you will have to use the
> command line. **If you're not sure how to use the command line, you should wait for the public
> release.**

Installation guide: https://replugged.dev/installation

## Installing plugins and themes

Plugins and themes are stored in the following folders in `/plugins` and `/themes` respectively:

- Windows: `%APPDATA%/replugged`
- macOS: `~/Library/Application Support/replugged`
- Other: `$XDG_CONFIG_HOME/replugged` or `~/.config/replugged`

These folders are automatically created the first time you run Replugged.

Using our [plugin template](https://github.com/replugged-org/plugin-template), running the build
command will automatically install the plugin into the correct folder. In the future, Replugged will
have a plugin/theme manager to make the process easier.

## FAQ

### Is this against the ToS?

Long story short... **yes**. Replugged is against the Discord Terms of Service — but, you should
keep reading:

As of right now, **Discord is not going out of their way to detect client mods or ban client mod
users**. On top of that, Replugged does not make any manual HTTP requests unlike certain client mods
/ plugins, so your client's user agent is the same as a legitimate client. Meaning, Discord doesn't
detect a client mod like Replugged. They can go out of their way to start detecting it, but they
don't.

Hypothetically speaking - even if they somehow did detect Replugged, users are very unlikely to be
banned on sight. It doesn't make sense for Discord to start banning a substantial part of it's
userbase (client mod users) without any kind of warning. Not to mention it is mandatory for
Replugged plugins to be fully API-compliant and ethical, implying Replugged users can't be banned
for indirect ToS violations (e.g. selfbotting).
