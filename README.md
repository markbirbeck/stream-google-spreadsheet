# stream-google-spreadsheet

Currently only reads rows.

Ideally I would use [google-worksheet-stream](https://www.npmjs.com/package/google-worksheet-stream) but I wasn't able to get it working so I just moved on. I'll revisit that library before adding any more features to this one though, just in case this one can be discarded.

## Usage

The module exposes two functions, each of which returns a [Highland stream](http://highlandjs.org/). The first function, available as the main `export`, returns each row of the spreadsheet as a JSON object:

```javascript
var sheetStream = require('stream-google-spreadsheet');

sheetStream(glob, opt)
  .each(console.log);
```

The output might look something like this:

```json
{
  "id": "https://spreadsheets.google.com/feeds/list/1KX8772HVDFBXYZ7tfOhE-bAuAgSLYABCVkgVwumDEFk/od6/private/full/blah4",
  "title": "E15bFDEX",
  "url": "E15bFDEX",
  "type": "SportsOrganization",
  "name": "Fujian White Crane Kung Fu",
  "mainEntityOfPage": "http://www.fwckungfu.com/",
  "logo": "images/icon/fwckungfu.jpg",
  "legalName": "Fujian White Crane Kung Fu & Tai Chi",
  "sport": "kung fu"
}
```

The second function wraps these JSON rows in `[Vinyl](https://github.com/wearefractal/vinyl)` objects and is available as `src()` off the main export:

```javascript
var sheetStream = require('stream-google-spreadsheet');

sheetStream.src(glob, opt)
  .each(console.log);
```

The Vinyl objects returned will have their `path` set to the `url` value in the data, the `data` propeerty set to the JSON returned, and the `contents` property set to a `Buffer` version of the JSON:

```json
{
  "path": "E15bFDEX",
  "data": {
    "title": "E15bFDEX",
    "url": "E15bFDEX",
    "type": "SportsOrganization",
    "name": "Fujian White Crane Kung Fu",
    "mainEntityOfPage": "http://www.fwckungfu.com/",
    "logo": "images/icon/fwckungfu.jpg",
    "legalName": "Fujian White Crane Kung Fu & Tai Chi",
    "sport": "kung fu"
  },
  "contents": ...
}
```

Whichever function is used, the parameters are the same:

The `glob` parameter contains one or more spreadsheet keys.

The `opt` parameter provides the keys used to log in (`opt.clientEmail` and `opt.privateKey`), as well as an optional indicator of which worksheet should be loaded (`opt.wsNum`).

To illustrate:

```javascript
var sheetStream = require('stream-google-spreadsheet');

sheetStream(
  'long number ID for spreadsheet',
  {
    clientEmail: process.env.SPREADSHEET_CLIENT_EMAIL,
    privateKey: process.env.SPREADSHEET_PRIVATE_KEY
  }
).each(console.log);
```

The stream created in this example will echo to the console each row of the specified spreadsheet.

## Column Names

A column name in a spreadsheet becomes the name of a property in the resulting JSON, which makes for a very convenient mapping. However, the property names are always lowercase, which is not so convenient. As a simple workaround we pass the object keys through LoDash's `camelCase` function, which means that if we want properties that are camel case in the resulting JSON then we need only use hyphens in the column names in the source spreadsheet.
