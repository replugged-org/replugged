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

See our [wiki page](https://github.com/replugged-org/replugged/wiki/Installing-plugins-and-themes)

## FAQ

### Does Replugged work?

Replugged is currently in a Developer preview. While it works and is fairly stable, some things still require using the command line or running code in the console. **If you're not familiar with programming or the command line, we recommend waiting until Replugged is released publicly.**

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

### Can I use Powercord plugins or themes?

No. Replugged was originally based on Powercord, but it is not anymore. Due to the new plugin/theme format, as well as Discord changes, Powercord plugins and themes will have to be rewritten.

### Can I use plugins and themes from legacy Replugged?

As mentioned above, legacy plugins and themes will need to be rewriten due to Discord changes, as well as changes to our plugin/theme format. 

### Can I use BetterDiscord plugins?

Not right now. Previously, [BDCompat](https://github.com/Juby210/bdCompat) was used to run BetterDiscord plugins. However, this has not been rewritten for the Replugged rewrite. Unless someone creates a version for the Replugged rewrite, BetterDiscord plugins are not supported.
