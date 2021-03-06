//created by ni on 11/10
//for the route /project
var express = require('express');
var router = express.Router();
var config = require('../config');
var apiformat = require('../apiformat');
var underscore = require('underscore');
var request = require('request');

router.route('/')
    //get project information with member
    .get(function (req, res, next) {
        var statusCode = 200;
        var success = true;
        var data = [];
        var message = 'get project info';
        //var privateToken = 'Y6ze4UDoJyyJAJXyW2fD';
        var projectMemberInfo = [];

        var opts = config.buildOptions("projects", "GET", false, req.get('PRIVATE-TOKEN'));
        opts.body = JSON.stringify(req.body);

        request(opts, function (error, response, body) {
            statusCode = response.statusCode;
            if (!error && statusCode == 200) {
                data = JSON.parse(body);
            } else {
                success = false;
                message = 'Get Projects Error!';
            }

            var formattedResponse = apiformat.formatResponse(statusCode, message, data, success);
            res.send(formattedResponse);
        });
    })
    //create a project with  current user,project name is required
    .post(function (req, res, next) {
        var statusCode = 201;
        var success = true;
        var data = [];
        var message = 'get project created';
        var formattedResponse;

        //if(req.body['name'] == null || req.body['type'] == null || req.body['namespace'] == null){
        if (req.body['name'] == null || req.body['namespace'] == null) {
            statusCode = 400;
            message = 'Bad request';
            data = [];
            success = false;

            formattedResponse = apiformat.formatResponse(statusCode, message, data, success);
            res.send(formattedResponse);
        }

        if (req.body['type'] == null) {
            req.body['type'] = 'user';
        }

        if (statusCode != 400) {
            var opts = config.buildOptions('namespaces?search=' + req.body['namespace'], 'GET', false, req.get('PRIVATE-TOKEN'));
            opts.body = JSON.stringify(req.body);

            request(opts, function (error, response, body) {
                var tempData = JSON.parse(body);
                for (var i = 0; i < tempData.length; i++) {
                    if (tempData[i].kind == req.body['type'] && tempData[i].path == req.body['namespace']) {
                        var namespaceId = tempData[i].id;

                        var optsTemp = config.buildOptions('projects/', 'POST', false, req.get('PRIVATE-TOKEN'));

                        req.body.namespace_id = namespaceId;
                        optsTemp.body = JSON.stringify(req.body);
                        console.log(optsTemp.body);
                        request(optsTemp, function (errorT, responseT, bodyT) {
                            statusCode = responseT.statusCode;
                            if (!errorT && statusCode == 200) {
                                data = JSON.parse(bodyT);
                            }
                            else {
                                success = false;
                                message = 'Create Projects Error!';
                            }

                        });
                    }
                }
                if (tempData.length == 0) {
                    statusCode = 404;
                    message = "Namespace not found";
                    success = false;
                }

                var formattedResponse = apiformat.formatResponse(statusCode, message, data, success);
                res.send(formattedResponse);
            })
        }
    })

router.route('/:id')
    .get(function (req, res, next) {
        var statusCode = 200;
        var success = true;
        var data = {};
        var message = 'Get Project detail Success';

        var opts = config.buildOptions("/projects/" + req.params.id, "GET", false, req.get('PRIVATE-TOKEN'));
        opts.body = JSON.stringify(req.body);

        request(opts, function (error, response, body) {
            statusCode = response.statusCode;

            if (!error && statusCode == 200) {
                var info = JSON.parse(body);
                data = info;
            }
            else {
                success = false;
                statusCode = 410;
                var errInfo = JSON.parse(body);
                message = errInfo.message;
                console.log('something wrong! ' + message);
                if (body) data = body;
            }
            var formattedResponse = apiformat.formatResponse(statusCode, message, data, success);
            res.send(formattedResponse);
        })
    })
    //update project not implemented yet
    .put(function (req, res, next) {
        var statusCode = 200;
        var message = 'Project updated!';
        var success = true;
        var data = [];

        var opts = config.buildOptions('projects/' + req.params.id, 'PUT', false, req.get('PRIVATE-TOKEN'));
        opts.body = JSON.stringify(req.body);

        request(opts, function (error, response, body) {
            statusCode = response.statusCode;
            if (!error && statusCode == 200) {
                data = JSON.parse(body);
            } else {
                success = false;
                message = 'Project not updated!';
            }

            var formattedResponse = apiformat.formatResponse(statusCode, message, data, success);
            res.send(formattedResponse);
        })
    })
    //delete project belonging to current user with project id
    .delete(function (req, res, next) {
        var statusCode = 200;
        var message = 'Project deleted!';
        var success = true;
        var data = [];

        var opts = config.buildOptions('projects/' + req.params.id, 'DELETE', false, req.get('PRIVATE-TOKEN'));
        opts.body = JSON.stringify(req.body);

        request(opts, function (error, response, body) {
            statusCode = response.statusCode;
            if (!error && statusCode == 200) {
                data = JSON.parse(body);
            } else {
                success = false;
                message = 'Project not deleted!';
            }

            var formattedResponse = apiformat.formatResponse(statusCode, message, data, success);
            res.send(formattedResponse);
        })
    })

//获取分支详细信息
router.route('/:id/repository/branches')
    .get(function (req, res, next) {
        var statusCode = 200;
        var success = true;
        var data = {};
        var message = 'Get project braches success';


        var opts = config.buildOptions("/projects/" + req.params.id + "/repository/branches", "GET", false, req.get('PRIVATE-TOKEN'));

        opts.body = JSON.stringify(req.body);

        request(opts, function (error, response, body) {
            statusCode = response.statusCode;

            if (!error && statusCode == 200) {
                var info = JSON.parse(body);
                data = info;
            } else {
                success = false;
                statusCode = 410;
                var errInfo = JSON.parse(body);
                message = errInfo.message;
                console.log('something wrong' + message);
                if (body) data = body;
            }

            var formattedResponse = apiformat.formatResponse(statusCode, message, data, success);
            res.send(formattedResponse);
        })


    })

//获取分支名
router.route('/:id/repository/branches/names')
    .get(function (req, res, next) {
        var statusCode = 200;
        var success = true;
        var data = {};
        data["name"] = new Array();
        var message = 'Get project braches success';


        var opts = config.buildOptions("/projects/" + req.params.id + "/repository/branches", "GET", false, req.get('PRIVATE-TOKEN'));

        opts.body = JSON.stringify(req.body);

        request(opts, function (error, response, body) {
            statusCode = response.statusCode;

            if (!error && statusCode == 200) {
                var info = JSON.parse(body);
                var dataAll = info;

                for (var i = 0; i < dataAll.length; i++) {
                    data["name"].push(dataAll[i].name);
                }


            } else {
                success = false;
                statusCode = 410;
                var errInfo = JSON.parse(body);
                message = errInfo.message;
                console.log('something wrong' + message);
                if (body) data = body;
            }

            var formattedResponse = apiformat.formatResponse(statusCode, message, data, success);
            res.send(formattedResponse);
        })

    })




/*新建分支
参数: 新分支名，分支基础名
*/
router.route("/:id/repository/branches/:branchname/:ref")
    .post(function (req, res, next) {
        var statusCode = 201;
        var success = true;
        var data = [];
        var message = 'create branch';
        var formattedResponse;

        var user_branchname = req.params.brachname;

        var opts = config.buildOptions('/projects/' + req.params.id + "/repository/branches?branch_name=" + req.params.branchname + "&ref=" + req.params.ref,
            'POST', false, req.get('PRIVATE-TOKEN'));
        opts.body = JSON.stringify(req.body);


        request(opts, function (error, response, body) {
            var name = response.name;

            if (name == user_branchname) {
                var info = JSON.parse(body);
                data = info;
            } else {
                success = false;
                statusCode = 410;
                var errInfo = JSON.parse(body);
                message = errInfo.message;
                console.log('something wrong' + message);
                if (body) data = body;
            }

            var formattedResponse = apiformat.formatResponse(statusCode, message, data, success);
            res.send(formattedResponse);
        })
    })

//代码分析接口，提供代码clone地址，代码分支信息
router.route("/:id/codeAnaylse")
    .get(function (req, res, next) {
        var statusCode = 200;
        var success = true;
        var data = [];
        var message = 'get code analyse info';
        var formatResponse

        var opts = config.buildOptions('/projects/' + req.params.id, "GET", false, req.get('PRIVATE-TOKEN'));
        opts.body = JSON.stringify(req.body);

        request(opts, function (error, response, body) {
            statusCode = response.statusCode;

            if (!error && statusCode == 200) {
                var info = JSON.parse(body);
                data = info.http_url_to_repo;
            }
            else {
                success = false;
                statusCode = 410;
                var errInfo = JSON.parse(body);
                message = errInfo.message;
                console.log('something wrong! ' + message);
                if (body) data = body;
            }
            var formattedResponse = apiformat.formatResponse(statusCode, message, data, success);
            res.send(formattedResponse);
        })
    })

module.exports = router;