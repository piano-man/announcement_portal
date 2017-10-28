$(document).ready(function () {

	//create app wide globals
	window.$globals = {
		baseUrl: "http://localhost:5034",
		registerState: {},
		formData: {}
	}


	//app wide settings
	$(document).ajaxStart(function () {
		$("#ajaxLoader").show();
		$(document.body).css({
			'overflow': 'hidden'
		})
	});

	$(document).ajaxStop(function () {
		window.setTimeout(function () {
			$("#ajaxLoader").hide();
			$(document.body).css({
				'overflow': 'scroll'
			})
		}, 500);
	});



	//attach methods to events 

	//login: login button click
	$("#login-btn").click(function () {
		caller.makeLoginRequest({
			'username': $('[name="username"]').val(),
			'password': $('[name="password"]').val(),
			'accountId': $('[name="accountId"]').val(),
		});
	});

	//add group
	$("#add-camera-btn").click(function () {
		validateResponse = caller.validateForm($('#add-camera-form'));
		if (validateResponse.status) {

			var locationhref =  window.location.href.replace("#","")
			locationhref = locationhref.split('/');

			validateResponse.data.customer_id = locationhref[locationhref.length - 1]

			caller.addCamera({
				'data': validateResponse.data
			}, function () {
				console.log("Performing Callback");
				
			});

		}
	});

	//add parent
	$("#add-customer-btn").click(function () {
		validateResponse = caller.validateForm($('#add-customer-form'));
		if (validateResponse.status) {
			console.log(validateResponse.data);
			caller.addCusomer({
				'data': validateResponse.data
			}, function () {
				console.log("Performing Callback");
			});
		}
	});








	//add Room
	$("#add-pi-btn").click(function () {
		validateResponse = caller.validateForm($('#add-pi-form'));
		if (validateResponse.status) {


			var locationhref =  window.location.href.replace("#","")
			locationhref = locationhref.split('/');

			validateResponse.data.customer_id = locationhref[locationhref.length - 1]

			caller.addPi({
				'data': validateResponse.data
			}, function () {
				console.log("Performing Callback");
				
			});

		}
	});


	//add Room
	$("#edit-camera-btn").click(function () {
		validateResponse = caller.validateForm($('#edit-camera-form'));
		if (validateResponse.status) {

			var data = {}; 

			for(key in validateResponse.data){
				 newkey = key.replace('edit-',''); 
				 data[newkey] = validateResponse.data[key]
			}

			data.camera_id = window.current_camera['id'];

			console.log(data);

			caller.editCamera({
				'data': data
			}, function () {
				console.log("Performing Callback");
				
			});

		}
	});



		//update customer
	$(".delete-camera-anchor").click(function () {


		var id = $(this).data('id');
		console.log("clicked",id);


		for(i=0;i<window.cameras.length;i++){
			if(id==window.cameras[i]['id']){
				window.current_camera = window.cameras[i];


				$("[name='edit-name']").val(current_camera.name);
				$("[name='edit-pi_mac']").val(current_camera.pi_mac);
				$("[name='edit-port']").val(current_camera.port);
				$("[name='edit-globalip']").val(current_camera.globalip);

				break;
			}
		}

		console.log(window.current_camera);

		swal({
            title: "Delete Room: "+ window.current_camera['name'],
            text: "Do you want to delete this entry?",
            type: "warning",
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true,
          },
          function () {
          	caller.deleteCamera({
          		camera_id : window.current_camera['id']
          	})
          });
	});





	//add Module
	$("#add-module-btn").click(function () {
		validateResponse = caller.validateForm($('#add-module-form'));
		if (validateResponse.status) {

			validateResponse.data['room_title'] = $("[data-room-id='"+validateResponse.data['room_id']+"']").data('room-title');

			var switch_list = [];
			var data = {}; 

			for(key in validateResponse.data){
				if(key.indexOf('id-') >= 0){
					continue;
				}
				if(key.indexOf('switch-') >= 0 ){
					switch_list.push({
						name : validateResponse.data[key],
						id : validateResponse.data["id-"+key]
					})
					continue;
				}

				//all other keys
				data[key] = validateResponse.data[key];
			}

			console.log(switch_list);
			data['switch_list'] = switch_list

			console.log(data);

			caller.addModule({
				'data': data
			}, function () {
				console.log("Performing Callback");
				
			});

		}
	});

	//get the list of modules for a particular room
	$(document.body).on('click','.list-module-anchor', function(){
		console.log("here");
		console.log($(this).data('id'));

		caller.getModules({
			'room_id': $(this).data('id')
		}, function () {
			console.log("Performing Callback");
			
		});
	});


	//get the list of switches for a particular module
	$(document.body).on('click','.list-switch-anchor', function(){

		console.log($(this).data('id'));

		caller.getSwitches({
			'module_id': $(this).data('id')
		}, function () {
			console.log("Performing Callback");
			
		});
	});






	//auto calculate the total amount
	$(document.body).on('keyup', '[name="totalQuantity"]', function () {
		var totalAmount = $('[name="totalQuantity"]').val() * $('[name="ratePerUnit"]').val()
		$('[name="totalAmount"]').val(totalAmount);
	});

	//define caller functions to be attached to the events
	var caller = {

		makeLoginRequest: function (params) {
			console.log(params);
			$.ajax({
				'url': "/login",
				'type': "POST",
				'data': JSON.stringify(params),
				'contentType': "application/json",
				success: function (response) {
					console.log(response);
					if (response['status']) {
						$.cookie("auth_token", response['auth_token']);
						$('#login-error').html("");
						$('#login-error').addClass("hidden");
						//call the dashboard end point with the auth_token saved in cookies
						window.location.href = "/dashboard";

					} else {
						$('#login-error').html(response['message']);
						$('#login-error').removeClass("hidden");
					}

				},
				failure: function (response) {
					console.log(response);
				}
			});
		},

		addCamera: function (params, callback) {
			/*
				params : {
					data
				}
			*/
			console.log(params);

			$.ajax({
				'url': "/camera",
				'type': "POST",
				'data': JSON.stringify(params),
				'contentType': "application/json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", $.cookie("auth_token"));
				},
				success: function (response) {
					console.log(response);
					if(response.status){
						swal("Done", "Success", "success");
						window.location.reload();
					}else{
						swal("Error",response.message , "error");
					}
				},
				failure: function (response) {
					console.log(response);
				}
			});
		},

		addCusomer: function (params, callback) {
			/*
				params : {
					data
				}
			*/
			console.log(params);

			$.ajax({
				'url': "/customers",
				'type': "POST",
				'data': JSON.stringify(params),
				'contentType': "application/json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", $.cookie("auth_token"));
				},
				success: function (response) {
					console.log(response);
					if(response.status){
						swal("Done", "Success", "success");
						window.location.reload();
					}else{
						swal("Error", response.message, "error");
					}
				},
				failure: function (response) {
					console.log(response);
				}
			});
		},

		editCamera: function (params, callback) {
			/*
				params : {
					data
				}
			*/
			console.log(params);

			$.ajax({
				'url': "/camera",
				'type': "PUT",
				'data': JSON.stringify(params),
				'contentType': "application/json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", $.cookie("auth_token"));
				},
				success: function (response) {
					console.log(response);
					if(response.status){
						swal("Done", "Success", "success");
						window.location.reload();
					}else{
						swal("Error", response.message, "error");
					}
				},
				failure: function (response) {
					console.log(response);
				}
			});
		},

		deleteCamera: function (params, callback) {
			/*
				params : {
					data
				}
			*/
			console.log(params);

			$.ajax({
				'url': "/camera/"+params['camera_id'],
				'type': "DELETE",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", $.cookie("auth_token"));
				},
				success: function (response) {
					console.log(response);
					if(response.status){
						swal("Done", "Success", "success");
						window.location.reload();
					}else{
						swal("Error", response.message, "error");
					}
				},
				failure: function (response) {
					console.log(response);
				}
			});
		},

		addPi: function (params, callback) {
			/*
				params : {
					data
				}
			*/
			console.log(params);

			$.ajax({
				'url': "/pi",
				'type': "POST",
				'data': JSON.stringify(params),
				'contentType': "application/json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", $.cookie("auth_token"));
				},
				success: function (response) {
					console.log(response);
					if(response.status){
						swal("Done", "Success", "success");
						window.location.reload();
					}else{
						swal("Error",response.message , "error");
					}
				},
				failure: function (response) {
					console.log(response);
				}
			});
		},

		addRoom: function (params, callback) {
			/*
				params : {
					data
				}
			*/
			console.log(params);

			$.ajax({
				'url': "/room",
				'type': "POST",
				'data': JSON.stringify(params),
				'contentType': "application/json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", $.cookie("auth_token"));
				},
				success: function (response) {
					console.log(response);
					if(response.status){
						swal("Done", "Success", "success");
						window.location.reload();
					}else{
						swal("Error",response.message , "error");
					}
				},
				failure: function (response) {
					console.log(response);
				}
			});
		},
		addModule: function (params, callback) {
			/*
				params : {
					data
				}
			*/
			console.log(params);

			$.ajax({
				'url': "/module",
				'type': "POST",
				'data': JSON.stringify(params),
				'contentType': "application/json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", $.cookie("auth_token"));
				},
				success: function (response) {
					console.log(response);
					if(response.status){
						swal("Done", "Success", "success");
						window.location.reload();
					}else{
						swal("Error",response.message , "error");
					}
				},
				failure: function (response) {
					console.log(response);
				}
			});
		},

		getModules: function (params, callback) {
			/*
				params : {
					data
				}
			*/
			console.log(params);

			$.ajax({
				'url': "/api/module?room_id="+params['room_id'],
				'type': "GET",
				'contentType': "application/json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", $.cookie("auth_token"));
				},
				success: function (response) {
					console.log(response);
					if(response.status){
						window.modules = response.modules;
						window.renderModuleList(window.modules);
					}else{
						swal("Error",response.message , "error");
					}
				},
				failure: function (response) {
					console.log(response);
				}
			});
		},

		getSwitches: function (params, callback) {
			/*
				params : {
					data
				}
			*/
			console.log(params);

			$.ajax({
				'url': "/api/switch?module_id="+params['module_id'],
				'type': "GET",
				'contentType': "application/json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", $.cookie("auth_token"));
				},
				success: function (response) {
					console.log(response);
					if(response.status){
						window.switches = response.switches;
						window.renderViewSwitchList(window.switches);

						$("#editModuleModal").modal("toggle");


						for(i=0;i<window.modules.length;i++){
							if(params['module_id']==window.modules[i]['_id']['$oid']){
								window.current_module = window.modules[i];

								$("[name='edit-module_name']").val(current_module.module_name);
								$("[name='edit-frequency']").val(current_module.frequency);
								$("[name='edit-no_of_switches']").val(current_module.no_of_switches);
								if(current_module.has_dimmer ||  current_module.has_dimmer == "true"){
									$("[name='edit-has_dimmer']").attr('checked','checked');
								}else{
									$("[name='edit-has_dimmer']").removeAttr('checked');
								}
								break;
							}
						}


					}else{
						swal("Error",response.message , "error");
					}
				},
				failure: function (response) {
					console.log(response);
				}
			});
		},

		validateForm: function (form, exceptions) {
			var datajson = {};
			var viewArr = form.serializeArray();

			var isValid = true;

			if (exceptions == undefined || exceptions == null) {
				exceptions = [];
			}

			for (var i in viewArr) {

				name = viewArr[i].name;

				//if name not in exceptions than carry out the validation
				if (exceptions.indexOf(name) < 0) {

					value = viewArr[i].value.trim()
					datajson[name] = value;

					if (value == "") {
						$('[name="' + name + '"]').addClass('form-error');
						isValid = false;
					} else {
						$('[name="' + name + '"]').removeClass('form-error');
					}
				}else{
					value = viewArr[i].value.trim()
					datajson[name] = value;
				}

			}
			console.log(datajson);
			if (!isValid) {
				return {
					status: false
				};
			}

			return {
				status: true,
				data: datajson
			};
		},

		renderTemplate : function (template, data, result, callback) {
			console.log(data);
            var template = $(template).html();
            var rendered = Mustache.render(template, {
                'data': data['data'],
                'isEmpty' : data['isEmpty']
            });
            $(result).html(rendered);
            callback();
        }

	}


})