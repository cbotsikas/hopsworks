/*
 * Changes to this file committed after and not including commit-id: ccc0d2c5f9a5ac661e60e6eaf138de7889928b8b
 * are released under the following license:
 *
 * This file is part of Hopsworks
 * Copyright (C) 2018, Logical Clocks AB. All rights reserved
 *
 * Hopsworks is free software: you can redistribute it and/or modify it under the terms of
 * the GNU Affero General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * Hopsworks is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE.  See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 *
 * Changes to this file committed before and including commit-id: ccc0d2c5f9a5ac661e60e6eaf138de7889928b8b
 * are released under the following license:
 *
 * Copyright (C) 2013 - 2018, Logical Clocks AB and RISE SICS AB. All rights reserved
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS  OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR  OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

angular.module('hopsWorksApp')

        .factory('MetadataRestService', ['$http', function ($http) {
            var service = {
              getMetadata: function (inodePid) {
                var req = {
                  method: 'GET',
                  url: '/api/metadata/' + inodePid,
                  headers: {
                    'Content-Type': 'application/json'
                  }
                };
                return $http(req);
              },

              /**
               * Add a JSON metadata object to an Inode (file/dir)
               * @param {type} user
               * @param {type} parentid
               * @param {type} inodename
               * @param {type} tableid
               * @param {type} data
               * @returns {unresolved}
               */
              addMetadataWithSchema: function (inodepid, inodename, tableid, metadataObj) {
                var jsonObj = JSON.stringify({
                  inodepid: inodepid,
                  inodename: inodename,
                  tableid: tableid,
                  metadata: metadataObj
                });
                var req = {
                  method: 'POST',
                  url: '/api/metadata/addWithSchema',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: jsonObj
                };
                return $http(req);
              },

              
              updateMetadata: function (inodepid, inodename, metadataObj) {
                var jsonObj = JSON.stringify({
                  inodepid: inodepid,
                  inodename: inodename,
                  tableid: -1,
                  metaid: metadataObj.id,
                  metadata: metadataObj
                });
                var req = {
                  method: 'POST',
                  url: '/api/metadata/updateWithSchema',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: jsonObj
                };
                return $http(req);
              },
              


              removeMetadata: function (inodepid, inodename, metadataObj) {
                var jsonObj =  JSON.stringify({
                  inodepid: inodepid,
                  inodename: inodename,
                  tableid: -1, //table id is not necessary when updating metadata
                  metaid: metadataObj.id,                  
                  metadata: metadataObj.data
                });
                var req = {
                  method: 'POST',
                  url: '/api/metadata/removeWithSchema',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: jsonObj
                };
                return $http(req);
              },

              addExtendedMetadata: function (projectID, projectName, datasetName, fileName, metadata) {
                var iNode = '/Projects/' + projectName + '/' + datasetName;
                if(fileName != null) {
                  iNode = iNode + '/' + fileName;
                }

                var jsonObj =  JSON.stringify({
                  filetemplateData: {
                    inodePath: iNode,
                    templateName: 'aegis'
                  },
                  metadata: metadata
                });

                var req = {
                  method: 'POST',
                  url: '/api/project/' + projectID + '/dataset/attachTemplateAndAddMetaData',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: jsonObj
                };
                return $http(req);
              }
              
            };
            return service;
          }]);
