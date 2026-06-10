[Go Back](/README.md)

# Debugging

It it possible to debug, set breakpoints, watch values etc. using Microsoft Visual Studio Code as the development tool.

### Prerequisites Software Installation

- Microsoft Visual Studio Code
- Google Chrome web browser.

### Set-up

- Open Visual Studio Code Extensions Marketplace and install the Microsoft 'Debugger for Chrome'.

![DebuggerForChrome](https://user-images.githubusercontent.com/14176120/106642776-b31a5a00-6580-11eb-92fd-5a6a948eb761.png)

## Client Side Javascript

Client side Javascript debugging is available using Google Chrome as the browser.

- Start the Firebase emulator and run the 'npm run dev' commands as normal
- Start the Chrome browser on your computer.

The debug command will launch a new instance of Chrome, however depending on your operating system, it may be a prerequisite for Chrome to be already running.

To start a Chrome debug session:

- In VSCode select the debug icon in the left hand menu
- Select the 'client:chrome' configration in the debugger selection drop down list
- Click the green triangular 'Play' icon.

![StartDebug](https://user-images.githubusercontent.com/14176120/106659570-d51ed700-6596-11eb-8780-34f85617598c.png)

Chrome should start a new browser session and navigation automatically to localhost:3000.

The debug toolbar should now be displayed and the attached client chrome session will be visible in the Call Stack Window.

![DebugToolbar](https://user-images.githubusercontent.com/14176120/106660552-106dd580-6598-11eb-9b78-ca29d0cc7f35.png)

![ChromeDebugSession](https://user-images.githubusercontent.com/14176120/106663839-2ed5d000-659c-11eb-9a78-b88a3a4b282c.png)

It should be possible to set breakpoints in any client side file that contains Javascript: &#042;/&#042;.vue, &#042;/statics/&#042;.js, &#042;/store/&#042;.js

- Login to the website as normal and navigate to a page where your breakpoint is set.  This must be performed in the browser session attached to the chrome debugger.  Any other browser sessions are not guaranteed to work.

![BreakpointHit](https://user-images.githubusercontent.com/14176120/106661563-3fd11200-6599-11eb-8279-a6002a97b747.png)

Once stopped on a breakpoint, the debug toolbar buttons 'Step Over', 'Step Into' and 'Step Out' will be available.

Watch values can be added quickly by:

- Hightlighting a value
- Right click
- Select 'Add to Watch'

![AddToWatch](https://user-images.githubusercontent.com/14176120/106661865-a22a1280-6599-11eb-80da-5a90dc57c392.png)

To end the debug session, either:

- Close the browser attached to the VSCode debug session
- Select the 'Stop' (Red square) on the debug toolbar.


## Server Side Javascript

Server side Javascript function debugging is available when the local Firebase emulator is started in debug mode.

To start the emulator in debug mode,

- Ensure any previous emulator command in terminated
- Start the emulator in debug mode as follows:

##### Mac/Linux

```bash
\$ npm run firebase-emulator-with-local-auth-debug
```

##### Windows

```
firebase emulators:exec 'node ./setup-emulator.js'  --inspect-functions --import=data/seed-with-journies-and-settings --ui
```

Once started, to attach VSCode to the emulator:

- In VSCode select the debug icon in the left hand menu
- Select the 'firebase functions: attach' configration in the debugger selection drop down list
- Click the green triangular 'Play' icon.

![Debug2](https://user-images.githubusercontent.com/14176120/106664123-8d02b300-659c-11eb-82d7-0dcefa8058d5.png)

The debug toolbar should now be displayed, the attached firebase function session will be visible in the Call Stack Window and the 'Debugger attached' message should appear in the emulator terminal log window.

![DebugToolbar](https://user-images.githubusercontent.com/14176120/106660552-106dd580-6598-11eb-9b78-ca29d0cc7f35.png)

![FirebaseAttached](https://user-images.githubusercontent.com/14176120/106664458-000c2980-659d-11eb-8a13-37738c19e675.png)

It should be possible to set breakpoints in any server function file &#042;/functions/&#042;.js

- Login to the website as normal and navigate to a page where your breakpoint will be hit.

![BreakpointHit2](https://user-images.githubusercontent.com/14176120/106664991-ace6a680-659d-11eb-992c-63d68a8db35c.png)

Once stopped on a breakpoint, the debug toolbar buttons 'Step Over', 'Step Into' and 'Step Out' will be available.  It is possible for the client browser to timeout in its request whilst debugging server side funnction.  Refreshing the browser should remedy this in most cases.

Watch values can be added quickly by:

- Hightlighting a value
- Right click
- Select 'Add to Watch'.

![AddToWatch2](https://user-images.githubusercontent.com/14176120/106665336-11096a80-659e-11eb-9555-7aec24504c97.png)


To end the debug session:

- Select the 'Unlick' (Chain icon) on the debug toolbar.

![Unlink](https://user-images.githubusercontent.com/14176120/106665551-5a59ba00-659e-11eb-8b0d-41b18cbfc288.png)


