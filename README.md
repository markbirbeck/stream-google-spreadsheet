# stream-google-spreadsheet

Read Google spreadsheet rows as a stream of either JSON or Vinyl objects.

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

The second function wraps these JSON rows in [Vinyl](https://github.com/wearefractal/vinyl) objects and is available as `src()` off the main export:

```javascript
var gulp = require('gulp');
var sheets = require('stream-google-spreadsheet');
var es = require('vinyl-elasticsearch');

gulp.task('index', function() {
  sheets.src(glob, opt)
    .pipe(es.dest(targetGlob, targetOpt));
});
```

The Vinyl objects returned from `src()` will have their `path` set to the `url` value in the data, the `data` propeerty set to the JSON returned, and the `contents` property set to a `Buffer` version of the JSON:

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

# Full Example

To illustrate, here is a complete example that takes rows in a spreadsheet and inserts them into an ElasticSearch index:

```javascript
var gulp = require('gulp');
var sheets = require('stream-google-spreadsheet');
var es = require('vinyl-elasticsearch');

var env = process.env;

gulp.task('index', function() {
  sheets.src(
    env.SPREADSHEET_KEYS.split(','),
    {
      clientEmail: env.SPREADSHEET_CLIENT_EMAIL,
      privateKey: env.SPREADSHEET_PRIVATE_KEY
    }
  )
    .pipe(es.dest({
        index: env.ELASTICSEARCH_INDEX
      },
      {
        host: env.ELASTICSEARCH_HOST,
        requestTimeout: env.ELASTICSEARCH_REQUEST_TIMEOUT
      }
    ))
    ;
});
```

## Column Names

A column name in a spreadsheet becomes the name of a property in the resulting JSON, which makes for a very convenient mapping. However, the property names are always lowercase, which is not so convenient. As a simple workaround we pass the object keys through LoDash's `camelCase` function, which means that if we want properties that are camel case in the resulting JSON then we need only use hyphens in the column names in the source spreadsheet.
