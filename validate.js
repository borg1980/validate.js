(function($) {
/*
	## DESCRIPTION

	This is a mini-validate script, which allows to validate form fields before form is submitted.
	It depends on jQuery (http://jquery.com/) v1.7+.
	It will use jquery.noty.js if available (http://needim.github.com/noty/).

	To apply validation to a field, add "data-validate" attribute, with space separated list
	of "validation" functions/rules:

	- "required" or "required:#some-other-field": checks if value of field (or target field) is not empty and is not the same as a placeholder text
	- "date": checks if value is in YYYY-MM-DD format
	- "number" or "number:integer": checks if value is number (floating point or integer) or number that is integer (not floating point)
	- "regexp::^regular-expression$" or "regexp:i:^regular-expression$": tests value against specified regular expression.
		First parameter is a modifier string passed to RegExp object. Second parameter is an regular expression (of course ;).
	- "eq:1" or "eq:#some-other-field-id": checks if value is equal to specified value, or value of another field
	- "neq:1" or "neq:#some-other-field-id": checks if value is different than specified value, or value of another field
	- "lt:1" or "lt:#some-other-field-id": checks if value is less than specified value, or value of another field
	- "lte:1" or "lte:#some-other-field-id": checks if value is less than or equal to specified value, or value of another field
	- "gt:1" or "gt:#some-other-field-id": checks if value is greater than specified value, or value of another field
	- "gte:1" or "gte:#some-other-field-id": checks if value is greater than or equal to specified value, or value of another field

	In case of *eq, lt* and gt*, if checked value is a string and it's compared to a number, then it's length is compared, not text.



	You can implement custom validation rules simply by attaching custom event handlers to the fields, e.g.,

	```
	$(document).on('customValidation1.myValidations', function(event, state, ops){
		state.valid = $(this).val() == 'whatever';
	})
	```
	and then specifying it in "data-validate" attribute, e.g.,

	```
	<input type="text" name="test" data-validate="customValidation1" />
	```

	Validation handler gets two arguments: state object and ops array. State object looks like this:

	```
	state = {
		mode: 'submit', // can be either 'change' or 'submit' depending on what triggered the validation
		valid: true, // validation status, defaults to true. Set to false to mark the field invalid
	};
	```

	Ops array is the validation rule split by colons, e.g., if rule was "customValidation1:one:two:three", then ops is:

	```
	ops = ['customValidation1', 'one', 'two', 'three'];
	```


	You can pass additional information after another colon (':'). All of the information will be passed with the `invalid` events
	triggered after validation. For example, with `data-validate` set to: "required::my-error-message-id" we will get:

	```
	var onInvalid = function (event, index, operator, o1, o2, o3) {
		// index is the index of validation rule, here it will be "0"
		// operator is the first part of the rule, here it will be "required"
		// o1 is the second part of the rule, here it will be empty, because we're not targetting different field
		// o2 is the third part of the rule, here it will be "my-error-message-id"

		// Now we can alert user to let him/her know, what is wrong with the value.
		if (operator === 'required') {
			alert(myMessages[o2]);
		}
	};
	$('select, input, textarea').on('invalid', onInvalid);
	```

	You can select more than one validation operator, e.g., "date required".
	You can use "data-validate-change" and/or "data-validate-submit" to specify different validation rules for different events (onchange and onsubmit).

	Use "data-validate-error-text" attribute to specify error message, which will be shown after invalid value is found.



	There can be an additional validation check added to FORM element:

	- "submitted": if any value was changed before and user tries to leave the page or close the window, confirmation dialog will pop up.

	Use "data-validate-error-text" attribute to specify warning message, which will be shown in the confirmation dialog.


	Fields will not be validated if they are `disabled`, if the form has `novalidate` attribute set or, in case of onsubmit validation,
	if submit button has `formnovalidate` attribute set. More information can be found at:
	https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-formnovalidate


	## LICENCE

	Copyright 2012-2014 Marcin Konicki.
	Copyright 2012-2014 Paweł Lewicki.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

if ($ === undefined) {
	if (console) console.log('validate.js depends on jQuery (http://jquery.com/).');
	return;
}

$(document)
	/* CUSTOM: "Operators" */
	.on('required.validate', 'select, input, textarea', function(event, state, ops){
		var target = ops[1];
		var field = (target ? $(target) : $(this)),
			type = field.attr('type'),
			m = $.trim(type != 'radio' ? field.val() : $('input:radio[name="'+field.attr('name')+'"]:checked').val()),
			placeholder = $.trim(field.attr('placeholder'));

		if (m.length < 1 || (type == 'checkbox' && !field.is(':checked')) || (placeholder && m === placeholder)) {
			state.valid = false;
		}
	})
	.on('date.validate', 'select, input, textarea', function(event, state, ops){
		var m = $.trim($(this).val());

		state.valid = true;

		if (m) {
			m = m.match(/^(\d{4})-(\d{2})-(\d{2})$/);
			if (m) {
				var d = new Date(m[1], (m[2]*1)-1, m[3]);
				state.valid = ((d.getMonth()+1 == m[2]*1) && (d.getDate() == m[3]*1) && (d.getFullYear() == m[1]*1));
				return;
			}
			state.valid = false;
		}
	})
	.on('number.validate', 'select, input, textarea', function(event, state, ops){
		var m = $.trim($(this).val());

		state.valid = true;

		if (m) {
			m = (ops[1] == 'integer' ? m.match(/^[\-+]?\d+$/) : m.match(/^[\-+]?\d+([.,]\d+)?$/));

			if (!m) {
				state.valid = false;
			}
		}
	})
	.on('regexp.validate', 'select, input, textarea', function(event, state, ops){
		var modifiers = ops[1];
		var rex = ops[2];
		var m = $.trim($(this).val());

		state.valid = true;

		if (m && rex) {
			var r = new RegExp(rex, modifiers);
			m = r.test(m);

			if (!m) {
				state.valid = false;
			}
		}
	})
	.on('compare.validate', 'select, input, textarea', function(event, state, ops){
		var operator = ops[0];
		var target = ops[1];
		var t = (target[0] == '#' ? $.trim($(target).val()) : target),
			v = $.trim($(this).val()),
			tn = t*1,
			vn = v*1;

		if (!v) return;

		if (!isNaN(tn) && !isNaN(vn)) {
			t = tn;
			v = vn;
		}

		// TODO: this is wrong if field value is numeric, but we need to check text length anyway.
		if (isNaN(vn) && !isNaN(tn)) {
			v = v.length;
		}

		switch (operator) {
			case 'eq':
				state.valid = (v == t);
				break;
			case 'neq':
				state.valid = (v != t);
				break;
			case 'lt':
				state.valid = (v < t);
				break;
			case 'lte':
				state.valid = (v <= t);
				break;
			case 'gt':
				state.valid = (v > t);
				break;
			case 'gte':
				state.valid = (v >= t);
				break;
			default:
				state.valid = true;
				break;
		}
	})
	/* CUSTOM: mark valid or invalid */
	.on('valid.validate', 'select, input, textarea', function(){
		$(this).removeClass('invalid').addClass('valid');
		return true;
	})
	.on('invalid.validate', 'select, input, textarea', function(event, index, operator){
		var node = $(this);

		// Prevent double notifications.
		if (node.hasClass('invalid')) return true;

		node.removeClass('valid').addClass('invalid');

		var t = node.attr('data-validate-error-text');
		if (!t) t = 'Value is invalid.';

		try {
			if (noty) noty({type: 'error', text: t, closeWith: ['click', 'button'], timeout: 3000});
		}
		catch(e){}

		return true;
	})
	/* CUSTOM: Validate value */
	.on('validate.validate', 'select, input, textarea', function(event, mode){
		var node = $(this);

		// WARNING: This may not work on IE < 9 if the field is disabled only through it's parent's "disabled" attribute.
		// Why it should work: https://developer.mozilla.org/en-US/docs/Web/CSS/:disabled
		// Why it may not: https://github.com/jquery/sizzle/issues/174
		// Include workaround: https://github.com/jquery/sizzle/pull/244/files#diff-97c8c06db741b10ac298cc03c28714a8R1322
		if (node.is(':disabled') || this.isDisabled === true || false) {
			node.removeClass('valid invalid');
			return true;
		}

		var validate = (mode ? node.attr('data-validate-'+mode) : node.attr('data-validate'));

		if (!validate) validate = node.attr('data-validate');
		if (!validate) return true;

		validate = validate.replace(/\s+/, ' ').split(' ');
		if (validate.length < 1) return true;

		var validationState = {
			mode: mode,
			valid: true
		};

		for (var i = 0; i < validate.length; i++) {
			var ops = validate[i].split(':');
			if (!ops || ops.length < 1) continue;

			switch (ops[0]) {
				case 'eq':
				case 'neq':
				case 'lt':
				case 'lte':
				case 'gt':
				case 'gte':
					node.trigger('compare', [validationState, ops]);
					break;
				default:
					node.trigger(ops[0], [validationState, ops]);
					break;
			}

			if (!validationState.valid) {
				ops.unshift(i);
				node.trigger('invalid', ops);
				return true;
			}
		}

		node.trigger('valid');
		return true;
	})
	/* CHANGE and SUBMIT: trigger validation */
	.on('change.validate', 'select, input, textarea', function(){
		var form = $(this).closest('form');
		if (form.is('[novalidate]')) {
			return;
		}

		$(this).trigger('validate', ['change']);
		form.addClass('changed');
	})
	.on('submit.validate', 'form:not([novalidate])', function(event){
		var fields = $('select,input,textarea', $(this));

		if ($(document.activeElement).is('[formnovalidate]')) {
			fields.removeClass('valid invalid');
			return;
		}

		fields.trigger('validate', ['submit']);

		if (fields.filter('.invalid:not(:disabled)').length > 0) return false;
		else $(this).removeClass('changed');
	})
;

$(window).on('beforeunload.validate', function(){
	var changed = $('form.changed[data-validate~="submitted"]:not([novalidate])');
	if (changed.length > 0) {
		var txt = '',
			dtxt = '';
		changed.each(function(){
			var t = $(this).attr('data-validate-error-text');
			if (t) txt += t + "\n";
			else dtxt = "Any data changed in the forms may be lost if it was not submitted.\n";
		});
		if (txt || dtxt) return dtxt + txt;
	}
});


})(jQuery);
