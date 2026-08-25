# shiggy-plugins

Custom plugins for ShiggyCord/Kettu/Vendetta-compatible Discord clients.

## DesktopSpoofer

A minimal plugin that intercepts Discord Gateway `IDENTIFY` payloads and reports the client browser as `Discord Client`, making the Android session present itself as Desktop where Discord uses this property for platform presence.

### Install in ShiggyCord

Open **Settings > Plugins > +** and paste:

```text
https://raw.githubusercontent.com/xdsantana/shiggy-plugins/gh-pages/
```

Then enable **DesktopSpoofer** and fully restart Discord so the next Gateway `IDENTIFY` packet is patched.

### Published files

The `gh-pages` branch contains only the runtime files required by the plugin loader:

- `manifest.json`
- `index.js`
- `.nojekyll`

### Credits

Based on the public-domain PlatformSpoofer implementation by btmc727 / OTKUSteyler. The original project is released under The Unlicense.

### Disclaimer

Discord client modifications are not officially supported by Discord and may violate its Terms of Service. Use at your own risk.
