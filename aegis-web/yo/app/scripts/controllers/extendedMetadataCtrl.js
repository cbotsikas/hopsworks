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
        .controller('ExtendedMetadataCtrl', ['$cookies', '$uibModal', '$scope', '$rootScope', '$routeParams',
          '$filter', 'DataSetService', 'ModalService', 'growl', 'MetadataActionService',
          'MetadataRestService', 'MetadataHelperService', 'ProjectService',
          function ($cookies, $uibModal, $scope, $rootScope, $routeParams, $filter, DataSetService,
                  ModalService, growl, MetadataActionService, MetadataRestService,
                  MetadataHelperService, ProjectService) {

            var self = this;
            self.metaData = {};
            self.metaDataDetail = {};
            self.currentFile = MetadataHelperService.getCurrentFile();
            self.tabs = [];
            self.meta = [];
            self.metainfo = [];
            self.visibilityInfo = [];
            self.availableTemplates = [];
            self.newTemplateName = "";
            self.extendedTemplateName = "";
            self.currentTableId = -1;
            self.currentTemplateID = -1;
            self.currentFileTemplates = [];
            self.selectedTemplate = {};
            self.editedField;
            self.toExtend = -1;
            self.currentBoard = {};
            self.toDownload;
            self.blob;
            self.templateContents = {};
            self.editingTemplate = false;
            self.projectInodeid = -1;
            self.noTemplates = false;

            self.rdf = {
              
              secondary_context: {
                "dcat": "http://www.w3.org/ns/dcat#",
                "dcatde": "http://dcat-ap.de/def/dcatde/",
                "dcterms": "http://purl.org/dc/terms/",
                "foaf": "http://xmlns.com/foaf/0.1/",
                "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
                "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
                "spdx": "http://spdx.org/rdf/terms#",
                "vcard": "http://www.w3.org/2006/vcard/ns#",
                "xsd": "http://www.w3.org/2001/XMLSchema#"
              },

              context: {
                description: {
                  type: 'rdfs:Literal',
                  uri: 'dct:description'
                },
                title: {
                  type: 'rdfs:Literal',
                  uri: 'dct:title'
                },
                publisher: {
                  type: 'foaf:Agent',
                  uri: 'dct:publisher'
                },
                homepage: {
                  type: 'foaf:Document',
                  uri: 'foaf:homepage'
                },
                spatial: {
                  type: 'dct:Location',
                  uri: 'dct:spatial'
                },
                language: {
                  type: 'dct:LinguisticSystem',
                  uri: 'dct:language'
                },
                license: {
                  '@id': 'https://www.dcat-ap.de/def/licenses/',
                  'type': '@id'
                }
              },

              data: {
                "@id" : "https://europeandataportal.eu/id/catalogue/edp",
                "@type" : "http://www.w3.org/ns/dcat#Catalog",
                description: {
                  type: 'rdfs:Literal',
                  uri: 'dct:description',
                  value: null
                },
                title: {
                  type: 'rdfs:Literal',
                  uri: 'dct:title',
                  value: null
                },
                publisher: {
                  type: 'foaf:Agent',
                  uri: 'dct:publisher',
                  value: null
                },
                homepage: {
                  type: 'foaf:Document',
                  uri: 'foaf:homepage',
                  value: null
                },
                license: {
                  type: 'dct:LicenseDocument',
                  uri: 'dct:license',
                  value: null
                },
                spatial: {
                  type: 'dct:Location',
                  uri: 'dct:spatial',
                  value: null
                },
                language: {
                  type: 'dct:LinguisticSystem',
                  uri: 'dct:language',
                  value: null
                }
              }
            };

            $scope.data = {
              fields: {
                title: {
                  label: 'Title',
                  placeholder: '',
                  model: null,
                  required: true
                },
                description: {
                  label: 'Description',
                  placeholder: '',
                  model: null,
                  required: true
                },
                publisher: {
                  label: 'Publisher',
                  placeholder: '',
                  model: null,
                  required: true
                },
                homepage: {
                  label: 'Homepage',
                  placeholder: '',
                  model: null,
                  required: true
                },
                license: {
                  label: 'License',
                  placeholder: '',
                  model: null,
                  required: true
                },
                spatial: {
                  label: 'Spatial',
                  placeholder: '',
                  model: null,
                  required: true
                },
                language: {
                  label: 'Language',
                  placeholder: '',
                  model: null,
                  required: true,
                  type: 'select',
                  options: [
                    {id: 'EN', name: 'English'},
                    {id: 'DE', name: 'German'}
                  ]
                }
              }
            };

            self.attachedDetailedTemplateList = [];

            var dataSetService = DataSetService($routeParams.projectID);

            //update the current template whenever other users make changes
            var listener = $rootScope.$on("template.change", function (event, response) {
              try {
                var incomingTemplateId = JSON.parse(response.board).templateId;

                if (self.currentTemplateID === incomingTemplateId) {
                  self.currentBoard = JSON.parse(response.board);
                }
              } catch (error) {
                //console.log(error);
              }
            });

            /*
             * Rootscope events are not deregistered when the controller dies.
             * So on the controller destroy event deregister the rootscope listener manually.
             * @returns {undefined}
             */
            $scope.$on("$destroy", function () {
              listener();
            });

            //fetch all the available templates
            MetadataHelperService.fetchAvailableTemplates()
                    .then(function (response) {
                      self.availableTemplates = JSON.parse(response.board).templates;
                      angular.forEach(self.availableTemplates, function (template, key) {
                        template.showing = false;
                      });
                    });
           

            self.saveExtendedMetadata = function () {
              console.log('Saving extended Metadata ...');
              console.log(self.generateRDFString());
            };

            self.generateRDFString = function () {
              console.log($scope.data.fields);
              // temporarily removed, didnt work
              
              // jsonld.compact(self.rdf.data, self.rdf.context, function(err, compacted) {
              //  console.log(JSON.stringify(compacted, null, 2));
              //  return compacted;
              // });
            }

            self.submitMetadata = function () {
              if (!self.metaData) {
                return;
              }
              //after the project inodeid is available proceed to store metadata
              MetadataRestService.addMetadataWithSchema(
                      parseInt(self.currentFile.parentId), self.currentFile.name, self.currentTableId, self.metaData)
                      .then(function (success) {
                        self.fetchMetadataForTemplate();
                      }, function (error) {
                        growl.error("Metadata could not be saved", {title: 'Info', ttl: 1000});
                      });
              //truncate metaData object
              angular.forEach(self.metaData, function (value, key) {
                if (!angular.isArray(value)) {
                  self.metaData[key] = "";
                } else {
                  self.metaData[key] = [];
                }
              });
            };


            self.hideAddTable = function () {
              return self.currentTemplateID !== -1 && self.currentTemplateID !== undefined &&
                      !self.editingTemplate
            };

            self.createMetadata = function (tableId, metadataId) {
              if (!self.metaData) {
                return;
              }
              var value = self.metaData[metadataId];
              if (!value || value.length === 0) {
                growl.info("Metadata field cannot be empty", {title: 'Info', ttl: 3000});
                return;
              }

              var tempInput = {};
              tempInput[metadataId] = value;
              MetadataRestService.addMetadataWithSchema(
                      parseInt(self.currentFile.parentId), self.currentFile.name, self.currentTableId, tempInput)
                      .then(function (success) {
                        self.metaData[metadataId] = '';
                        self.fetchMetadataForTemplate();
                      }, function (error) {
                        growl.error("Metadata could not be saved", {title: 'Info', ttl: 1000});
                        self.metaData[metadataId] = '';
                        self.fetchMetadataForTemplate();
                      });
            };
          }
        ]);
