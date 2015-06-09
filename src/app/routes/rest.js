

function Rest(router, Api) {
    var self = this;
    self.handleRoutes(router, Api);
}
/**
 * Handle Route from Request
 * @param router
 * @param Api
 */
Rest.prototype.handleRoutes= function(router, Api) {
    var userCtr = Api.controller('UserController');

	var organizationCtr = Api.controller('OrganizationController');
	var studentCtr = Api.controller('StudentController');
	var indexCtr = Api.controller('Index');
	var addressController = Api.controller('AddressController');
	var auth = Api.controller('Auth');

	router.get('/', indexCtr.index);
	router.get('/heartbeat', function(req, res) {
        res.send('OK');
    });


	router.route('/user')
		.get(auth.isBearerAuthenticated, userCtr.get)
        .put(auth.isBearerAuthenticated, userCtr.save)
        .post(auth.isBearerAuthenticated, userCtr.create)
        .delete(auth.isBearerAuthenticated, userCtr.deleteByEmail)
    ;

    router.route('/organizations')
        .post(auth.isBearerAuthenticated, organizationCtr.create)
        .put(auth.isBearerAuthenticated, organizationCtr.save)
        .get(auth.isBearerAuthenticated, organizationCtr.get);

    router.route('/:organizationId').get(auth.isBearerAuthenticated, organizationCtr.get);
    router.route('/:organizationId/profile').get(auth.isBearerAuthenticated, organizationCtr.profile);
    router.route('/:organizationId/users').get(auth.isBearerAuthenticated, organizationCtr.allUsers);
    router.route('/:organizationId/users/:userId').get(auth.isBearerAuthenticated, organizationCtr.getUser);
    router.route('/:organizationId/programs').get(auth.isBearerAuthenticated, organizationCtr.allProgram);
    router.route('/:organizationId/programs/:programId').get(auth.isBearerAuthenticated, organizationCtr.getProgram);

    router.route('/:organizationId/students')
          .post(auth.isBearerAuthenticated, studentCtr.createByOrgId)
          .get(auth.isBearerAuthenticated, studentCtr.getStudents);

    router.route('/:organizationId/students/:studentId')
        .get(auth.isBearerAuthenticated, studentCtr.getStudentById)
        .delete(auth.isBearerAuthenticated, studentCtr.deleteStudentById);

    router.route('/:organizationId/students/:studentId/backpack').get(auth.isBearerAuthenticated, studentCtr.getStudentsBackpack);
    router.get('/:organizationId/students/:studentId/backpack-skip', studentCtr.getStudentsBackpack);



};

module.exports = Rest;