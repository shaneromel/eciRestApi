projectId = 'election-contest';
const {Translate} = require('@google-cloud/translate');
const translate = new Translate({projectId});

module.exports=translate;