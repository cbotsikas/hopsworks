/*
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
 *
 */

angular.module('hopsWorksApp')
        .controller('ViewSearchResultCtrl', ['$scope', '$uibModalInstance',
          'RequestService', 'DataSetService', 'growl', 'response',
          'result', 'projects', 'DelaProjectService', 'DelaService', 'HopssiteService',
          'ProjectService', 'ModalService', '$routeParams', '$location', '$rootScope',
          function ($scope, $uibModalInstance, RequestService, DataSetService,
                  growl, response, result, projects, DelaProjectService, DelaService, HopssiteService,
                  ProjectService, ModalService, $routeParams, $location, $rootScope) {
            var self = this;
            self.request = {'inodeId': "", 'projectId': "", 'message': ""};
            self.projects = projects;
            self.content = result;
            self.spinner = false;
            self.result = response;
            self.request.projectId = self.result.projectId;
            self.thisProjectId = $routeParams.projectID;
            if (result.type === 'proj') {
              self.type = 'Project';
              self.requestType = 'Send join request';
              self.infoMembers = 'Members in this project.';
              self.infoDS = 'Datasets in this project.';
              self.sendRequest = function () {
                RequestService.joinRequest(self.request).then(
                        function (success) {
                          $uibModalInstance.close(success);
                        }, function (error) {
                  growl.error(error.data.errorMsg, {title: 'Error', ttl: 5000, referenceId: 21});
                });
              };
            } else if ((result.type === 'inode' || result.type === 'ds') && !result.public_ds) {
              self.type = 'Dataset';
              self.requestType = 'Send access request';
              self.infoMembers = 'Members of the owning project.';
              self.infoDS = 'Projects this dataset is shared with.';
              self.request.inodeId = self.result.inodeId;
              self.sendRequest = function () {
                RequestService.accessRequest(self.request).then(function (success) {
                  $uibModalInstance.close(success);
                }, function (error) {
                  growl.error(error.data.errorMsg, {title: 'Error', ttl: 5000, referenceId: 21});
                });
              };
            } else if ((result.type === 'inode' || result.type === 'ds') &&
                    result.public_ds && (result.localDataset || result.downloaded)) {
              self.type = 'Public Dataset';
              self.requestType = 'Add DataSet';
              self.infoMembers = 'Members of the owning project.';
              self.infoDS = 'Projects this dataset is shared with.';
              self.request.inodeId = self.result.inodeId;
              self.sendRequest = function () {
                if (self.request.projectId === undefined || self.request.projectId === "") {
                  growl.error("Select a project to import the Dataset to", {title: 'Error', ttl: 5000, referenceId: 21});
                  return;
                }
                ProjectService.getDatasetInfo({inodeId: result.id}).$promise.then(
                        function (response) {
                          var datasetDto = response;
                          ProjectService.importPublicDataset({}, {'id': self.request.projectId,
                            'inodeId': datasetDto.inodeId, 'projectName': datasetDto.projectName}).$promise.then(
                                  function (success) {
                                    growl.success("Dataset Imported", {title: 'Success', ttl: 1500});
                                    $uibModalInstance.close(success);
                                  }, function (error) {
                            growl.error(error.data.errorMsg, {title: 'Error', ttl: 5000, referenceId: 21});
                          });
                        }, function (error) {
                  console.log('Error: ', error);
                });
              };
            } else if ((result.type === 'inode' || result.type === 'ds') &&
                    result.public_ds && !result.localDataset && !result.downloaded) {
              self.type = 'Public Dataset';
              self.requestType = 'Download';
              self.infoMembers = 'Members of the owning project.';
              self.infoDS = 'Projects this dataset is shared with.';
              self.request.inodeId = self.result.inodeId;
              self.sendRequest = function () {
                if (self.request.projectId === undefined || self.request.projectId === "") {
                  growl.error("Select a project to import the Dataset to", {title: 'Error', ttl: 5000, referenceId: 21});
                  return;
                }
                var params = {size: 'md', projectId: self.request.projectId, datasetId: result.publicId,
                  defaultDatasetName: result.name, bootstrap: result.partners};
                ModalService.setupDownload(params).then(function (success) {
                }, function (error) {
                  if (error.data && error.data.details) {
                    growl.error(error.data.details, {title: 'Error', ttl: 1000});
                  }
                  self.delaHopsService = new DelaProjectService(self.request.projectId);
                  self.delaHopsService.unshareFromHops(result.publicId, false).then(function (success) {
                    growl.info("Download cancelled.", {title: 'Info', ttl: 1000});
                  }, function (error) {
                    growl.warning(error, {title: 'Warning', ttl: 1000});
                  });
                });
              };
            }

            var dataSetService = DataSetService(self.projectId);
            $scope.readme = null;

            self.getReadme = function () {
              self.spinner = false;
              if ($scope.readme !== null) {
                return;
              }
              if (self.content.id === undefined) {
                $scope.readme = null;
                return;
              }
              if (self.content.localDataset) {
                self.spinner = true;
                console.log("getReadme view search result: ", self.content);
                HopssiteService.getReadmeByInode(self.content.id).then(
                  function (success) {
                    var content = success.data.content;
                    self.spinner = false;
                    var conv = new showdown.Converter({parseImgDimensions: true});
                    $scope.readme = conv.makeHtml(content);
                  }, function (error) {
                    //To hide README from UI
                    self.spinner = false;
                    growl.error(error.data.errorMsg, {title: 'Error retrieving README file', ttl: 5000, referenceId: 3});
                    $scope.readme = null;
                });
              } else {
                self.spinner = true;
                DelaService.getReadme(self.content.publicId, self.content.bootstrap).then(function (success) {
                  self.spinner = false;
                  var content = success.data.content;
                  var conv = new showdown.Converter({parseImgDimensions: true});
                  $scope.readme = conv.makeHtml(content);
                }, function (error) {
                  self.spinner = false;
                  growl.error(error.data.errorMsg, {title:'Error retrieving README file', ttl: 5000, referenceId: 3});
                  $scope.readme = null;
                });
              }
            };

            self.sizeOnDisk = function (fileSizeInBytes) {
              return convertSize(fileSizeInBytes);
            };

            self.close = function () {
              $uibModalInstance.dismiss('cancel');
            };

            self.goto = function () {
              if (self.content.type == "ds") {
                var projectId;
                // getting project id
                for(var i = 0; i < self.content.map.entry.length; i++) {
                  if (self.content.map.entry[i].key == "project_id") {
                    projectId = self.content.map.entry[i].value;
                  }
                }
                $location.path("/project/" + projectId + "/datasets/" + self.content.name + "/");
                $uibModalInstance.dismiss('close');
                return
              }
              var splitedPath = self.content.details.path.split("/");
              var parentPath = "/";

              for (var i = 3; i < splitedPath.length - 1; i++) {
                parentPath = parentPath + splitedPath[i] + "/";
              }
              $rootScope.selectedFile = splitedPath[splitedPath.length - 1];

              var projectId = self.thisProjectId;
              if (projectId == undefined) projectId = self.content.id;

              $location.path("/project/" + projectId + "/datasets" + parentPath);

              $uibModalInstance.dismiss('close');
            };
          }]);

