# Cordova Email Plugin

[![Greenkeeper badge](https://badges.greenkeeper.io/hypery2k/cordova-email-plugin.svg)](https://greenkeeper.io/)


[![Build Status](https://travis-ci.org/hypery2k/cordova-email-plugin.svg?branch=master)](https://travis-ci.org/hypery2k/cordova-email-plugin) [![Build status](https://ci.appveyor.com/api/projects/status/d1g8ygx20or6htpg?svg=true)](https://ci.appveyor.com/project/hypery2k/cordova-email-plugin) [![npm version](https://badge.fury.io/js/cordova-plugin-email.svg)](http://badge.fury.io/js/cordova-plugin-email) [![Dependency Status](https://david-dm.org/hypery2k/cordova-email-plugin.svg)](https://david-dm.org/hypery2k/cordova-email-plugin) [![devDependency Status](https://david-dm.org/hypery2k/cordova-email-plugin/dev-status.svg)](https://david-dm.org/hypery2k/cordova-email-plugin#info=devDependencies) 

> The plugin provides access to the standard interface that manages the editing and sending an email message. You can use this view controller to display a standard email view inside your application and populate the fields of that view with initial values, such as the subject, email recipients, body text, and attachments. The user can edit the initial contents you specify and choose to send the email or cancel the operation.

[![NPM](https://nodei.co/npm/cordova-plugin-email.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/cordova-plugin-email/)

<a name="donation"></a>
> Feel free to **donate**
>
> <a href='http://www.pledgie.com/campaigns/33053'><img alt='Click here to lend your support and make a donation at www.pledgie.com !' src='http://www.pledgie.com/campaigns/33053.png?skin_name=chrome' border='0' /></a>
> <a target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=AGPGLZYNV6Y5S">
> <img alt="" border="0" src="https://www.paypalobjects.com/de_DE/DE/i/btn/btn_donateCC_LG.gif"/>
> </img></a>
> Or donate Bitcoins: bitcoin:3NKtxw1SRYgess5ev4Ri54GekoAgkR213D
>
> [![Bitcoin](https://martinreinhardt-online.de/bitcoin.png)](bitcoin:3NKtxw1SRYgess5ev4Ri54GekoAgkR213D)
>
> Also via [greenaddress](https://greenaddress.it/pay/GA3ZPfh7As3Gc2oP6pQ1njxMij88u/)

## Installation

```bash
$ cordova plugin add cordova-plugin-email
```
Or if you want to use the development version (nightly build), which maybe not stable!:

```
cordova plugin add cordova-plugin-email@next
```

<img width="260px" align="right" hspace="7" vspace="5" src="https://github.com/hypery2k/cordova-email-plugin/raw/master/sample.png">

Using this interface does not guarantee immediate delivery of the corresponding email message. The user may cancel the creation of the message, and if the user does choose to send the message, the message is only queued in the Mail application outbox. This allows you to generate emails even in situations where the user does not have network access, such as in airplane mode. This interface does not provide a way for you to verify whether emails were actually sent.<br><br>


## Overview
1. [Supported Platforms](#supported-platforms)
2. [Installation](#installation)
3. [ChangeLog](#changelog)
4. [Using the plugin](#using-the-plugin)
5. [Examples](#examples)
6. [Quirks](#quirks)


## Supported Platforms
- __iOS__
- __Android__
- __Amazon FireOS__
- __Windows__
- __Browser__


### PhoneGap Build
Add the following xml to your config.xml to always use the latest version of this plugin:
```xml
<gap:plugin name="cordova-plugin-email-composer" version="0.8.3" source="npm" />
```


## Changelog

- See [CHANGELOG.md][changelog] to get the full changelog for the plugin.

## Using the plugin
The plugin creates the object ```cordova.plugins.email``` with following methods:

1. [email.isAvailable][available]
2. [email.open][open]

### Plugin initialization
The plugin and its methods are not available before the *deviceready* event has been fired.

```javascript
document.addEventListener('deviceready', function () {
    // cordova.plugins.email is now available
}, false);
```

### Determine if the device is capable to send emails
The ability to send emails can be revised through the `email.isAvailable` interface. The method takes a callback function, passed to which is a boolean property. Optionally the callback scope can be assigned as a second parameter.

The Email service is only available on devices capable which are able to send emails. E.g. which have configured an email account and have installed an email app. You can use this function to hide email functionality from users who will be unable to use it.

```javascript
cordova.plugins.email.isAvailable(
    function (isAvailable) {
        // alert('Service is not available') unless isAvailable;
    }
);
```

If you want to open a draft in a specific application, just pass its uri scheme on iOS, or its name on Android as first parameter, to check whether the application is installed or not. The callback function will return a second parameter of type boolean then.

```javascript
cordova.plugins.email.isAvailable(
    urischeme, function (isAvailable, withScheme) {
        // alert('Service is not available') unless isAvailable;
    }
);

```

>**Note**: If the user didn't have any email account configured on iOS this will also return false

### Open a pre-filled email draft
A pre-filled email draft can be opened through the `email.open` or `email.openDraft` interface. The method takes a hash as an argument to specify the email's properties. All properties are optional. Further more it accepts an callback function to be called after the email view has been dismissed.

After opening the draft the user may have the possibilities to edit, delete or send the email.

#### Further informations
- An [configured email account][available] is required to send emails.
- Attachments can be either base64 encoded datas, files from the the device storage or assets from within the *www* folder.
- The default value for *isHTML* is *true*.
- Its possible to [specify][email_app] the email app on Android and iOS.
- See the [examples][examples] for how to create and show an email draft.

```javascript
cordova.plugins.email.open({
    to:          Array, // email addresses for TO field
    cc:          Array, // email addresses for CC field
    bcc:         Array, // email addresses for BCC field
    attachments: Array, // file paths or base64 data streams
    subject:    String, // subject of the email
    body:       String, // email body (for HTML, set isHtml to true)
    isHtml:    Boolean, // indicats if the body is HTML or plain text
}, callback, scope);
```


## Examples

### Open an email draft
The following example shows how to create and show an email draft pre-filled with different kind of properties.

```javascript
cordova.plugins.email.open({
    to:      'max@mustermann.de',
    cc:      'erika@mustermann.de',
    bcc:     ['john@doe.com', 'jane@doe.com'],
    subject: 'Greetings',
    body:    'How are you? Nice greetings from Leipzig'
});
```

Of course its also possible to open a blank draft.
```javascript
cordova.plugins.email.open();
```

### Send HTML encoded body
Its possible to send the email body either as text or HTML. In the case of HTML the `isHTML` properties needs to be set.

```javascript
cordova.plugins.email.open({
    to:      'max@mustermann.de',
    subject: 'Greetings',
    body:    '<h1>Nice greetings from Leipzig</h1>',
    isHtml:  true
});
```

When building for the browser, you *cannot* use HTML in the body content. Internally, this plugin generates a "mailto:"-style link to support browsers, and the mailto URI scheme only supports plain text body content. See [RFC6068](https://www.ietf.org/rfc/rfc6068.txt) for more details on mailto URIs.

### Get informed when the view has been dismissed
The `open` method supports additional callback to get informed when the view has been dismissed.

```javascript
cordova.plugins.email.open(properties, function () {
    console.log('email view dismissed');
}, this);
```

### Adding attachments
Attachments can be either base64 encoded datas, files from the the device storage or assets from within the *www* folder.

#### Attach Base64 encoded content
The code below shows how to attach an base64 encoded image which will be added as a image with the name *icon.png*.

```javascript
cordova.plugins.email.open({
    subject:     'Cordova Icon',
    attachments: 'base64:icon.png//iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/...'
});
```

#### Attach files from the device storage
The path to the files must be defined absolute from the root of the file system.

```javascript
cordova.plugins.email.open({
    attachments: 'file:///storage/sdcard/icon.png', //=> Android
});
```

#### Attach native app resources
Each app has a resource folder, e.g. the _res_ folder for Android apps or the _Resource_ folder for iOS apps. The following example shows how to attach the app icon from within the app's resource folder.

```javascript
cordova.plugins.email.open({
    attachments: 'res://icon.png' //=> res/drawable/icon (Android)
});
```

#### Attach assets from the www folder
The path to the files must be defined relative from the root of the mobile web app folder, which is located under the _www_ folder.

```javascript
cordova.plugins.email.open({
    attachments: [
        'file://img/logo.png', //=> assets/www/img/logo.png (Android)
        'file://css/index.css' //=> www/css/index.css (iOS)
    ]
});
```

### Specify email app
Its possible to specify the email app which shall open the draft for further editing. Just pass its scheme name through the drafts app-attribute. If the phone isn´t able to handle the specified scheme it will fallback to standard.

```javascript
// Specify app by scheme name
cordova.plugins.email.open({
    app: 'mailto',
    subject: 'Sent with mailto'
})
```

On _Android_ the app can be specified by either an alias or its package name. The alias _gmail_ is available by default.

```javascript
// Add app alias
cordova.plugins.email.addAlias('gmail', 'com.google.android.gm');

// Specify app by name or alias
cordova.plugins.email.open({
    app: 'gmail',
    subject: 'Sent from Gmail'
})
```


## Quirks

### HTML and CSS on Android
Even Android is capable to render HTML formatted mails, most native Mail clients like the standard app or Gmail only support rich formatted text while writing mails. That means that __CSS cannot be used__ (no _class_ and _style_ support).

The following table gives an overview which tags and attributes can be used:

<table>
<td width="60%">
    <ul>
        <li><code>&lt;a href="..."&gt;</code></li>
        <li><code>&lt;b&gt;</code></li>
        <li><code>&lt;big&gt;</code></li>
        <li><code>&lt;blockquote&gt;</code></li>
        <li><code>&lt;br&gt;</code></li>
        <li><code>&lt;cite&gt;</code></li>
        <li><code>&lt;dfn&gt;</code></li>
        <li><code>&lt;div align="..."&gt;</code></li>
        <li><code>&lt;em&gt;</code></li>
        <li><code>&lt;font size="..." color="..." face="..."&gt;</code></li>
        <li><code>&lt;h1&gt;</code></li>
        <li><code>&lt;h2&gt;</code></li>
        <li><code>&lt;h3&gt;</code></li>
    </ul>
</td>
<td width="40%">
    <ul>
        <li><code>&lt;h4&gt;</code></li>
        <li><code>&lt;h5&gt;</code></li>
        <li><code>&lt;h6&gt;</code></li>
        <li><code>&lt;i&gt;</code></li>
        <li><code>&lt;img src="..."&gt;</code></li>
        <li><code>&lt;p&gt;</code></li>
        <li><code>&lt;small&gt;</code></li>
        <li><code>&lt;strike&gt;</code></li>
        <li><code>&lt;strong&gt;</code></li>
        <li><code>&lt;sub&gt;</code></li>
        <li><code>&lt;sup&gt;</code></li>
        <li><code>&lt;tt&gt;</code></li>
        <li><code>&lt;u&gt;</code></li>
    </ul>
</td>
</table>

### HTML and CSS on Windows
HTML+CSS formatted body are not supported through the native API for Windows.


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

### Development

### Testing

Android and iOS Tooling setup, see 
```
export PLATFORM=android # or ios ..
npm run clean && npm run setupDemoApp && npm run build
```


## License

This software is released under the [Apache 2.0 License][apache2_license].

© 2013-2016 appPlant UG, Inc. All rights reserved


[cordova]: https://cordova.apache.org
[ios_guide]: http://developer.apple.com/library/ios/documentation/MessageUI/Reference/MFMailComposeViewController_class/Reference/Reference.html
[wp8_guide]: http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh394003.aspx
[CLI]: http://cordova.apache.org/docs/en/edge/guide_cli_index.md.html#The%20Command-line%20Interface
[PGB]: http://docs.build.phonegap.com/en_US/index.html
[npm]: https://www.npmjs.com/package/cordova-plugin-email-composer
[messageui_framework]: #compile-error-on-ios
[changelog]: https://github.com/katzer/cordova-plugin-email-composer/blob/master/CHANGELOG.md
[available]: #determine-if-the-device-is-capable-to-send-emails
[open]: #open-a-pre-filled-email-draft
[email_app]: #specify-email-app
[examples]: #examples
[apache2_license]: http://opensource.org/licenses/Apache-2.0
