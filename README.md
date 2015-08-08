# stream-google-spreadsheet

Currently only reads rows.

Ideally I would use [google-worksheet-stream](https://www.npmjs.com/package/google-worksheet-stream) but I wasn't able to get it working so I just moved on. I'll revisit that library before adding any more features to this one though, just in case this one can be discarded.

## Usage

The module exposes a single function:

```javascript
var sheetStream = require('stream-google-spreadsheet');

sheetStream(stream, glob, opt);
```

The `stream` parameter is any writeable stream.

The `glob` parameter contains one or more spreadsheet keys.

The `opt` parameter provides the keys used to log in (`opt.clientEmail` and `opt.privateKey`), as well as an optional indicator of which worksheet should be loaded (`opt.wsNum`).

To illustrate:

```javascript
var highland = require('highland');
var sheetStream = require('stream-google-spreadsheet');
var exampleStream = highland().each(console.log);

sheetStream(
  exampleStream,
  'long number ID for spreadsheet',
  {
    clientEmail: process.env.SPREADSHEET_CLIENT_EMAIL,
    privateKey: process.env.SPREADSHEET_PRIVATE_KEY
  }
);
```

The `highland` stream created in this example will echo to the console each row of the specified spreadsheet.

## Column Names

A column name in a spreadsheet becomes the name of a property in the resulting JSON, which makes for a very convenient mapping. However, the property names are always lowercase, which is not so convenient. As a simple workaround we pass the object keys through LoDash's `camelCase` function, which means that if we want properties that are camel case in the resulting JSON then we need only use hyphens in the column names in the source spreadsheet.
