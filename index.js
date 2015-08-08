var _ = require('lodash');
var h = require('highland');

var GoogleSpreadsheet = require('google-spreadsheet');

module.exports = function(glob, opt) {
  return h(Array.isArray(glob) ? glob : [glob])
    .consume(getSheet)
    .consume(getRows)
    .map(tidyRow)
    ;

  /**
   * Get a worksheet given its key:
   */

  function getSheet(error, key, push, next) {
    if (error) {
      push(error);
      next();
      return;
    }

    if (key === h.nil) {
      push(null, h.nil);
      return;
    }

    var mySheet = new GoogleSpreadsheet(key);

    mySheet.useServiceAccountAuth({
        'client_email': opt.clientEmail,
        'private_key': opt.privateKey
      },
      function(err) {
        if (err) {
          console.error('Error using spreadsheet credentials:', err);
          push(err);
          next();
        } else {
          mySheet.getInfo(function(err, sheetInfo) {
            if (err) {
              console.error('Error getting sheet information:', err);
              push(err);
            } else {
              push(null, sheetInfo);
            }
            next();
          });
        }
      }
    );
  }

  /**
   * Get the rows of a worksheet:
   */

  function getRows(error, sheet, push, next) {
    if (error) {
      console.log(error);
      push(error);
      next();
      return;
    }

    if (sheet === h.nil) {
      push(null, h.nil);
      return;
    }

    /**
     * Get the rows from the specified worksheet (usually the first
     * but allow the offset to be overridden):
     */

    sheet
      .worksheets[opt.wsNum || 0]
      .getRows(function(err, rows) {
        if (err) {
          console.error('Error getting rows:', err);
          push(err);
        } else {
          rows.forEach(function(row) {
            push(null, row);
          });
        }
        next();
      });
  }

  /**
   * Tidy up the properties of the spreadsheet row:
   */

  function tidyRow(row) {
    return _(row)

      /**
       * Remove a bunch of properties:
       */

      .omit(['_xml', 'content', '_links', 'save', 'del'])

      /**
       * Remove any empty fields:
       */

      .omit(_.partial(_.isEqual, ''))

      /**
       * Convert column names to camelcase since we receive them
       * as all lower case:
       */

      .mapKeys(_.rearg(_.camelCase, 1))
      .value();
  }
};
