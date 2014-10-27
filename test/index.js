function assert(expr, msg) {
	if (!expr) throw new Error(msg || 'failed');
}

function runMochaTests(callback) {
	$('#mocha').html('');

	var runner = mocha.run();
	runner.on('test end', callback);
	return runner;
}

describe('Validate', function(){
	var form = null;
	var input = null;

	var addElement = function(nodeName, attributes){
		var id = 'test-'+Date.now()+'-'+Math.floor(Math.random()*1000);
		var html = $('<'+nodeName+' id="'+id+'"'+(nodeName === 'input' ? '/>' : '></' + nodeName + '>'));
		if (attributes) {
			$.each(attributes, function(index, value){
				html.attr(index, value);
			});
		}
		form.append(html);
		return $('#'+id);
	};

	before(function(){
		var id = 'test-'+Date.now();
		$('body').append('<form id="'+id+'"></form>');
		form = $('#'+id);
	});

	beforeEach(function(){
		$('.valid, .invalid', form).removeClass('.valid .invalid');
	});

	afterEach(function(){
		if (input && input.length) {
			input.remove();
			input = null;
		}
	});

	after(function(){
		form.remove();
		form = null;
	});

	describe('required', function(){
		it('should mark empty text input field as invalid', function(){
			input = addElement('input', {'data-validate': 'required'});
			input.trigger('validate');
			assert(input.hasClass('invalid'));
		});

		it('should mark non-empty text input field as valid', function(){
			input = addElement('input', {'data-validate': 'required', 'value': Date.now()});
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});

		it('should mark unchecked checkbox input field as invalid', function(){
			input = addElement('input', {'type': 'checkbox', 'data-validate': 'required'});
			input.trigger('validate');
			assert(input.hasClass('invalid'));
		});

		it('should mark checked checkbox input field as valid', function(){
			input = addElement('input', {'type': 'checkbox', 'data-validate': 'required', 'checked': 'checked'});
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});

		it('should mark unchecked radio input field as invalid', function(){
			var name = 'name-'+Date.now();
			input = $()
					.add(addElement('input', {'type': 'radio', 'name': name, 'data-validate': 'required'}))
					.add(addElement('input', {'type': 'radio', 'name': name, 'data-validate': 'required'}))
			;
			input.trigger('validate');
			assert(input.hasClass('invalid'));
		});

		it('should mark 1st checked radio input field as valid', function(){
			var name = 'name-'+Date.now();
			input = $()
					.add(addElement('input', {'type': 'radio', 'name': name, 'data-validate': 'required', 'checked': 'checked'}))
					.add(addElement('input', {'type': 'radio', 'name': name, 'data-validate': 'required'}))
			;
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});

		it('should mark 2nd checked radio input field as valid', function(){
			var name = 'name-'+Date.now();
			input = $()
					.add(addElement('input', {'type': 'radio', 'name': name, 'data-validate': 'required'}))
					.add(addElement('input', {'type': 'radio', 'name': name, 'data-validate': 'required', 'checked': 'checked'}))
			;
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});

		it('should mark select field without options as invalid', function(){
			input = addElement('select', {'data-validate': 'required'});
			input.trigger('validate');
			assert(input.hasClass('invalid'));
		});

		it('should mark unselected select field with two options as invalid', function(){
			input = addElement('select', {'data-validate': 'required'})
					.append('<option value="">none</option>')
					.append('<option value="one">one</option>')
			;
			input.trigger('validate');
			assert(input.hasClass('invalid'));
		});

		it('should mark selected select field as valid', function(){
			input = addElement('select', {'data-validate': 'required'})
					.append('<option value="">none</option>')
					.append('<option value="one" selected="selected">one</option>')
			;
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});
	});

	describe('date', function(){
		it('should mark incorrect date format as invalid', function(){
			input = addElement('input', {'data-validate': 'date', 'value': 'NotADate'});
			input.trigger('validate');
			assert(input.hasClass('invalid'));
		});

		it('should mark correct date format as valid', function(){
			input = addElement('input', {'data-validate': 'required', 'value': '2014-10-27'});
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});
	});

	describe('number', function(){
		it('should mark incorrect number format as invalid', function(){
			input = addElement('input', {'data-validate': 'number', 'value': 'NotANumber'});
			input.trigger('validate');
			assert(input.hasClass('invalid'));
		});

		it('should mark -1234 as valid number', function(){
			input = addElement('input', {'data-validate': 'number', 'value': '-1234'});
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});

		it('should mark 1234 as valid number', function(){
			input = addElement('input', {'data-validate': 'number', 'value': '1234'});
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});

		it('should mark -12.34 as valid number', function(){
			input = addElement('input', {'data-validate': 'number', 'value': '-12.34'});
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});

		it('should mark 12.34 as valid number', function(){
			input = addElement('input', {'data-validate': 'number', 'value': '12.34'});
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});

		it('should mark -12e34 as valid number', function(){
			input = addElement('input', {'data-validate': 'number', 'value': '-12e34'});
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});

		it('should mark 12e34 as valid number', function(){
			input = addElement('input', {'data-validate': 'number', 'value': '12e34'});
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});

		describe(':integer', function(){
			it('should mark -1234 as valid number:integer', function(){
				input = addElement('input', {'data-validate': 'number:integer', 'value': '1234'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark 1234 as valid number:integer', function(){
				input = addElement('input', {'data-validate': 'number:integer', 'value': '1234'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark -12.34 as invalid number:integer', function(){
				input = addElement('input', {'data-validate': 'number:integer', 'value': '-12.34'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark 12.34 as invalid number:integer', function(){
				input = addElement('input', {'data-validate': 'number:integer', 'value': '-12.34'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark -12e34 as valid number:integer', function(){
				input = addElement('input', {'data-validate': 'number:integer', 'value': '-12e34'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark 12e34 as valid number:integer', function(){
				input = addElement('input', {'data-validate': 'number:integer', 'value': '12e34'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});
		});
	});

	describe('regexp', function(){
		it('should mark "a-1-2-3" as valid for regexp:i:^a-\\d-\\d-\\d$', function(){
			input = addElement('input', {'data-validate': 'regexp:i:^a-\\d-\\d-\\d$', 'value': 'a-1-2-3'});
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});

		it('should mark "A-1-2-3" as valid for regexp:i:^a-\\d-\\d-\\d$', function(){
			input = addElement('input', {'data-validate': 'regexp:i:^a-\\d-\\d-\\d$', 'value': 'A-1-2-3'});
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});

		it('should mark "A-1-2-3" as invalid for regexp::^a-\\d-\\d-\\d$', function(){
			input = addElement('input', {'data-validate': 'regexp::^a-\\d-\\d-\\d$', 'value': 'A-1-2-3'});
			input.trigger('validate');
			assert(input.hasClass('invalid'));
		});

		it('should mark "whatever" as invalid for regexp:i:^a-\\d-\\d-\\d$', function(){
			input = addElement('input', {'data-validate': 'regexp:i:^a-\\d-\\d-\\d$', 'value': 'whatever'});
			input.trigger('validate');
			assert(input.hasClass('invalid'));
		});
	});

	describe('comparison', function(){
		describe('eq', function(){
			it('should mark 123 as equal to 123', function(){
				input = addElement('input', {'data-validate': 'eq:123', 'value': '123'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark 1234 as inequal to 123', function(){
				input = addElement('input', {'data-validate': 'eq:123', 'value': '1234'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark "test" as equal to "test"', function(){
				input = addElement('input', {'data-validate': 'eq:test', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark "testing" as inequal to "test"', function(){
				input = addElement('input', {'data-validate': 'eq:test', 'value': 'testing'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark "test" as equal to 4', function(){
				input = addElement('input', {'data-validate': 'eq:4', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark "test" of one input as equal to "test" of another input', function(){
				input = $()
						.add(addElement('input', {'value': 'test'}))
						.add(addElement('input', {'value': 'test'}))
				;
				input.eq(1).attr('data-validate', 'eq:#'+input.eq(0).attr('id'));
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});
		});

		describe('neq', function(){
			it('should mark 123 as invalid when equal to 123', function(){
				input = addElement('input', {'data-validate': 'neq:123', 'value': '123'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark 1234 as valid when inequal to 123', function(){
				input = addElement('input', {'data-validate': 'neq:123', 'value': '1234'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark "test" as invalid when equal to "test"', function(){
				input = addElement('input', {'data-validate': 'neq:test', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark "testing" as valid when inequal to "test"', function(){
				input = addElement('input', {'data-validate': 'neq:test', 'value': 'testing'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark "test" as invalid when equal to 4', function(){
				input = addElement('input', {'data-validate': 'neq:4', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark "testing" as valid when inequal to 4', function(){
				input = addElement('input', {'data-validate': 'neq:4', 'value': 'testing'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark "test" as invalid when equal to "test" of another input', function(){
				input = $()
						.add(addElement('input', {'value': 'test'}))
						.add(addElement('input', {'value': 'test'}))
				;
				input.eq(1).attr('data-validate', 'neq:#'+input.eq(0).attr('id'));
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark "test" as valid when inequal to "testing" of another input', function(){
				input = $()
						.add(addElement('input', {'value': 'test'}))
						.add(addElement('input', {'value': 'testing'}))
				;
				input.eq(1).attr('data-validate', 'neq:#'+input.eq(0).attr('id'));
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});
		});

		describe('lt', function(){
			it('should mark 123 as valid when less than 1234', function(){
				input = addElement('input', {'data-validate': 'lt:1234', 'value': '123'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark -12.3 as valid when less than 1234', function(){
				input = addElement('input', {'data-validate': 'lt:1234', 'value': '-12.3'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark 12345 as invalid when less than 1234', function(){
				input = addElement('input', {'data-validate': 'lt:1234', 'value': '12345'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark 123 as invalid when less than -123', function(){
				input = addElement('input', {'data-validate': 'lt:-123', 'value': '123'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark "test" as valid when less than 5', function(){
				input = addElement('input', {'data-validate': 'lt:5', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark "test" as invalid when less than 3', function(){
				input = addElement('input', {'data-validate': 'lt:3', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});
		});

		describe('lte', function(){
			it('should mark 123 as valid when less than or equal to 123', function(){
				input = addElement('input', {'data-validate': 'lte:123', 'value': '123'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark 123 as valid when less than or equal to 1234', function(){
				input = addElement('input', {'data-validate': 'lte:1234', 'value': '123'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark 12345 as invalid when less than or equal to 1234', function(){
				input = addElement('input', {'data-validate': 'lte:1234', 'value': '12345'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark 123 as invalid when less than or equal -123', function(){
				input = addElement('input', {'data-validate': 'lte:-123', 'value': '123'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark "test" as valid when less than or equal to "test"', function(){
				input = addElement('input', {'data-validate': 'lte:test', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark "test" as valid when less than or equal to 5', function(){
				input = addElement('input', {'data-validate': 'lte:5', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark "test" as valid when less than or equal to 4', function(){
				input = addElement('input', {'data-validate': 'lte:4', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark "test" as invalid when less than or equal to 3', function(){
				input = addElement('input', {'data-validate': 'lte:3', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});
		});

		describe('gt', function(){
			it('should mark 123 as valid when greater than 12', function(){
				input = addElement('input', {'data-validate': 'gt:12', 'value': '123'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark 123 as valid when greater than -12.3', function(){
				input = addElement('input', {'data-validate': 'gt:-12.3', 'value': '123'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark 123 as invalid when greater than 1234', function(){
				input = addElement('input', {'data-validate': 'gt:1234', 'value': '123'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark -123 as invalid when greater than 123', function(){
				input = addElement('input', {'data-validate': 'gt:123', 'value': '-123'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark "test" as valid when greater than 3', function(){
				input = addElement('input', {'data-validate': 'gt:3', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark "test" as invalid when greater than 4', function(){
				input = addElement('input', {'data-validate': 'gt:4', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});
		});

		describe('gte', function(){
			it('should mark 123 as valid when greater than or equal to 123', function(){
				input = addElement('input', {'data-validate': 'gte:123', 'value': '123'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark 123 as valid when greater than or equal to 12', function(){
				input = addElement('input', {'data-validate': 'gte:12', 'value': '123'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark 123 as invalid when greater than or equal to 1234', function(){
				input = addElement('input', {'data-validate': 'gte:1234', 'value': '123'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark -123 as invalid when greater than or equal 123', function(){
				input = addElement('input', {'data-validate': 'gte:123', 'value': '-123'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});

			it('should mark "test" as valid when greater than or equal to "test"', function(){
				input = addElement('input', {'data-validate': 'gte:test', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark "test" as valid when greater than or equal to 4', function(){
				input = addElement('input', {'data-validate': 'gte:4', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark "test" as valid when greater than or equal to 3', function(){
				input = addElement('input', {'data-validate': 'gte:3', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('valid'));
			});

			it('should mark "test" as invalid when greater than or equal to 5', function(){
				input = addElement('input', {'data-validate': 'gte:5', 'value': 'test'});
				input.trigger('validate');
				assert(input.hasClass('invalid'));
			});
		});
	});

	describe('custom', function(){
		before(function(){
			$(document).on('customTest1.myValidations', 'select, input, textarea', function(event, state, ops){
				state.valid = $(this).val() === 'whatever';
			});
		});

		after(function(){
			$(document).off('customTest1.myValidations', 'select, input, textarea');
		});

		it('should mark "whatever" as valid for customTest1', function(){
			input = addElement('input', {'data-validate': 'customTest1', 'value': 'whatever'});
			input.trigger('validate');
			assert(input.hasClass('valid'));
		});

		it('should mark "test" as invalid for customTest1', function(){
			input = addElement('input', {'data-validate': 'customTest1', 'value': 'test'});
			input.trigger('validate');
			assert(input.hasClass('invalid'));
		});
	});
});
