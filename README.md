Espruino App Loader (and Apps) for  ROCK and Magic 3 Smart Watches
==============================

## Installation

For a brand-new watch, you need to follow the instructions [here](https://github.com/fanoush/ds-d6/tree/master/espruino/DFU/Magic3) produced by @fanoush. Also following these instructions downgrade to SoftDevice S140-6.0.0.  After that you can flash the zip file from the firmware [directory](https://github.com/jeffmer/ROCKApps/tree/main/firmware).

This build has a modified `lcd_spi_unbuf` module. The build makes the full 8 megabytes available to Espruino applications. 

Once Espruino is involved use the [App Loader](https://jeffmer.github.io/ROCKApps/) to load `Bootloader`, `Main`, `Launcher` and `Settings` followed by the apps and widgets you want.


These provide a simple Bangle emulation environment which will let you load Bangle Apps from its App Loader. Only clock apps are really supported as these watches do not have GPS, Compass etc.

Someone brave can try GadgetBridge which may work.....

