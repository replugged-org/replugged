const { Plugin } = require('powercord/entities');
const express = require('express');
const app = express();
let httpserv;

module.exports = class RDLinks extends Plugin {
  async startPlugin () {
    app.get('/', (req, res) => {
      res.send('You are not supposed to be here.');
    });

    app.get('/install/:what', (req, res) => {
      console.log(req.query);
      if (req.params.what === 'plugin') {
        res.send(`Sent prompt to install ${req.params.what} from ${req.query.address}`);
      }
    });


    httpserv = app.listen(6473);
  }

  async pluginWillUnload () {
    httpserv.close();
  }
};
