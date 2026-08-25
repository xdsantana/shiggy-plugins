# shiggy-plugins

Custom plugins for ShiggyCord/Kettu/Vendetta-compatible Discord clients.

## DesktopSpoofer

A minimal plugin that patches the live Discord Gateway socket and changes the outgoing `IDENTIFY` payload so the Android session reports `browser: "Discord Client"`.

The plugin watches the real Gateway socket returned by `getSocket`, patches both the high-level socket sender and its internal WebSocket transport, and requests one reconnect when it is enabled on an already connected session.

### Install in ShiggyCord

Open **Settings > Plugins > +** and paste:

```text
https://raw.githubusercontent.com/xdsantana/shiggy-plugins/gh-pages/
```

Then enable **DesktopSpoofer**. The current build requests the Gateway reconnect automatically, but fully restarting Discord after an update is still recommended.

### Published files

The `gh-pages` branch contains only the runtime files required by the plugin loader:

- `manifest.json`
- `index.js`
- `.nojekyll`

### Credits

Originally based on the public-domain PlatformSpoofer implementation by btmc727 / OTKUSteyler. The live Gateway socket approach is adapted from the PlatformSpoof implementation in fshinz/Revenge-Plugins.

### Disclaimer

Discord client modifications are not officially supported by Discord and may violate its Terms of Service. Use at your own risk.
