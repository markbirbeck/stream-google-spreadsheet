var _ = require('lodash');

var GoogleSpreadsheet = require('google-spreadsheet');

module.exports = function(stream, glob, opt) {
  if (!Array.isArray(glob)) {
    glob = [glob];
  }

  glob.forEach(function(key) {
    var mySheet = new GoogleSpreadsheet(key);

    mySheet.useServiceAccountAuth({
        'client_email': opt.clientEmail,
        'private_key': opt.privateKey
      },
      function(err) {
        if (err) {
          console.error('Error using spreadsheet credentials:', err);
          return;
        }

        mySheet.getInfo(function(err, sheetInfo) {
          if (err) {
            console.error('Error getting sheet information:', err);
            return;
          }

          /**
           * Get the rows from the specified worksheet (usually the first
           * but allow the offset to be overridden):
           */

          sheetInfo
            .worksheets[opt.wsNum || 0]
            .getRows(function(err, rows) {
              if (err) {
                console.error('Error getting rows:', err);
                return;
              }

              /**
               * Write out each row to the stream, with a bit of tidying up:
               */

              rows.forEach(function(row) {
                stream.write(
                  _(row)

                    /**
                     * Remove a bunch of properties:
                     */

                    .omit(row, ['_xml', 'content', '_links', 'save', 'del'])

                    /**
                     * Remove any empty fields:
                     */

                    .omit(_.partial(_.isEqual, ''))

                    /**
                     * Convert column names to camelcase since we receive them
                     * as all lower case:
                     */

                    .mapKeys(_.rearg(_.camelCase, 1))
                    .value()
                );
              });
            });
        });
      }
    );
  });
};
