/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var debug = require('debug')('bot:controller');
var extend = require('extend');
var Promise = require('bluebird');
var conversation = require('./api/conversation');
var alchemyLanguage = require('./api/alchemy-language');
var format = require('string-template');
var pick = require('object.pick');

var constMessage = require('./const.js');

var sendMessageToConversation = Promise.promisify(conversation.message.bind(conversation));
// var extractMessage = Promise.promisify(alchemyLanguage.extractMessage.bind(alchemyLanguage));
// var executeQuery = Promise.promisify(conversation.executeQuery.bind(conversation));

module.exports = {
  /**
   * Process messages from a channel and send a response to the user
   * @param  {Object}   message.user  The user
   * @param  {Object}   message.input The user meesage
   * @param  {Object}   message.context The conversation context
   * @param  {Function} callback The callback
   * @return {void}
   */

  processMessage: function (_message, callback, req) {
    var message = extend({ input: { text: _message.body.text } }, _message.body);
    var input = message.text ? { text: message.text } : message.input;
    var user = message.user || message.from;
    var responseContextMess = null;

    if (_message.session && _message.session.user) {
      var dbUser = _message.session.user;
    }
    var context = dbUser ? dbUser.context : {};
    message.context = context;

    sendMessageToConversation(message)
      .then(function (response) {
        
          return response; 
      })
      .then(function (messageToUser) {      
        if (!dbUser) {
          dbUser = { _id: user };
        }
        if(messageToUser.output.text ==""){
          messageToUser.output.text = constMessage.isEmptyMess();
        }
        dbUser.context = messageToUser.context;
        _message.session.user = dbUser;
        messageToUser = extend(messageToUser, _message.body);
        callback(null, messageToUser);
        
      })
      // Catch any issue we could have during all the steps above
      .catch(function (error) {
        debug(error);
        callback(error);
      });
  }
}
