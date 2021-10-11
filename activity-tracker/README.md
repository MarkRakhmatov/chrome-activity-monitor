## How to use/develop

- change directory to your newly created project
- run `npm run start`
- goto: `chrome://extensions` in the browser and enable `'developer mode'`
- press `Load unpacked` and target the folder `angular/dist`

The project is automatically being watched, any changes to the files will recompile the project.

**NOTE**: changes to the **content page** and **service worker** scripts requires you to reload the extension in `chrome://extensions`

## Build/package for production

- update version number inside `./angular/src/manifest.json`
- run `npm run build:production`
- upload `extension-build.zip` to the chrome webstore.

This will run a production build and will automatically zip it as a extension package in the root folder named: `extension-build.zip`

## Debugging
Run: `npm start`

Go to: Developer tools (inspect popup) => Sources => webpack

You can find your source files (TypeScript) over there.

## Angular folder

This folder contains the angular source code.
Each feature (popup,options,tab) lives inside its own module and gets lazily loaded.

see: `./angular/src/app/modules`

## Chrome folder

This folder contains the content page/service worker scripts.
