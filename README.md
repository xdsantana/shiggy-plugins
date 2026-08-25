# shiggy-plugins

Private source repository for custom ShiggyCord plugins.

## DesktopSpoofer

A minimal ShiggyCord/Kettu/Vendetta-compatible plugin that intercepts Discord Gateway IDENTIFY payloads and reports the client browser as `Discord Client`, making the Android session present itself as Desktop where Discord uses this property for platform presence.

The public deployment branch intentionally contains only the compiled plugin files required by the plugin loader.
