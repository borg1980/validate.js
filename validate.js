(function($) {
/*
	## DESCRIPTION

	This is a mini-validate script, which allows to validate form fields before form is submitted.
	It depends on jQuery (http://jquery.com/) v1.7+.
	It will use jquery.noty.js if available (http://needim.github.com/noty/).

	To apply validation to a field, add "data-validate" attribute, with space separated list
	of "validation" functions:

	- "required" or "required:#some-other-field": checks if value of field (or target field) is not empty
	- "date": checks if value is in YYYY-MM-DD format
	- "number" or "number:integer": checks if value is number (floating point or integer) or number that is integer (not floating point)
	- "regexp::^regular-expression$" or "regexp:i:^regular-expression$": tests value against specified regular expression.
	     First parameter is a modifiers string passed to RegExp object. Second parameter is an regular expression (of course ;).
	- "eq:1" or "eq:#some-other-field-id": checks if value is equal to specified value, or value of another field
	- "lt:1" or "lt:#some-other-field-id": checks if value is less than specified value, or value of another field
	- "lte:1" or "lte:#some-other-field-id": checks if value is less than or equal to specified value, or value of another field
	- "gt:1" or "gt:#some-other-field-id": checks if value is greater than specified value, or value of another field
	- "gte:1" or "gte:#some-other-field-id": checks if value is greater than or equal to specified value, or value of another field

	You can select more than one validation operator, e.g., "date required".
	You can use "data-validate-change" and/or "data-validate-submit" to specify different validation for different events (onchange and onsubmit).

	Use "data-validate-error-text" attribute to specify error message, which will be shown after invalid value is found.


	There can be an additional validation check added to FORM element:

	- "submitted": if any value was changed before and user tries to leave the page or close the window, confirmation dialog will pop up.

	Use "data-validate-error-text" attribute to specify warning message, which will be shown in the confirmation dialog.



	## LICENCE

	Copyright 2012 Marcin Konicki.
	Copyright 2012 Paweł Lewicki.

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
	if (console) console.log('validate.js depends jQuery (http://jquery.com/).');
	return;
}

$(document).ready(function(){
	var validateStatus = true;

	$(document)
		/* CUSTOM: "Operators" */
		.on('required.validate', 'select, input, textarea', function(event, dummy, target){
			var m = $.trim($(this).val());
			if (m.length < 1) {
				validateStatus = false;
			}
		})
		.on('date.validate', 'select, input, textarea', function(){
			var m = $.trim($(this).val());

			validateStatus = true;

			if (m) {
				m = m.match(/^(\d{4})-(\d{2})-(\d{2})$/);
				if (m) {
					var d = new Date(m[1], (m[2]*1)-1, m[3]);
					validateStatus = ((d.getMonth()+1 == m[2]*1) && (d.getDate() == m[3]*1) && (d.getFullYear() == m[1]*1));
					return;
				}
				validateStatus = false;
			}
		})
		.on('number.validate', 'select, input, textarea', function(event, dummy, type){
			var m = $.trim($(this).val());

			validateStatus = true;

			if (m) {
			    m = (type == 'integer' ? m.match(/^[-+]?\d+$/) : m.match(/^[-+]?\d+([.,]\d+)?$/));

				if (!m) {
					validateStatus = false;
				}
			}
		})
		.on('regexp.validate', 'select, input, textarea', function(event, dummy, modifiers, rex){
			var m = $.trim($(this).val());

			validateStatus = true;

			if (m && rex) {
				var r = new RegExp(rex, modifiers);
				m = r.test(m);

				if (!m) {
					validateStatus = false;
				}
			}
		})
		.on('compare.validate', 'select, input, textarea', function(event, operator, target){
			var t = (target[0] == '#' ? $.trim($(target).val()) : target),
			    v = $.trim($(this).val()),
				tn = t*1,
				vn = v*1;

			if (!v) return;

			if (!isNaN(tn) && !isNaN(vn)) {
				t = tn;
				v = vn;
			}

			switch (operator) {
				case 'eq':
					validateStatus = (v == t);
					break;
				case 'lt':
					validateStatus = (v < t);
					break;
				case 'lte':
					validateStatus = (v <= t);
					break;
				case 'gt':
					validateStatus = (v > t);
					break;
				case 'gte':
					validateStatus = (v >= t);
					break;
				default:
					validateStatus = true;
					break;
			}
		})
		/* CUSTOM: mark valid or invalid */
		.on('valid.validate', 'select, input, textarea', function(){
			$(this).removeClass('invalid').addClass('valid');
			return true;
		})
		.on('invalid.validate', 'select, input, textarea', function(){
			var node = $(this);

			// Prevent double notifications.
			if (node.hasClass('invalid')) return true;

			node.removeClass('valid').addClass('invalid');

			var t = node.attr('data-validate-error-text');
			if (!t) t = 'Value is invalid.';

			if (noty) noty({type: 'error', text: t, closeButton: true, timeout: 3000});
			return true;
		})
		/* CUSTOM: Validate value */
		.on('validate.validate', 'select, input, textarea', function(event, state){
			validateStatus = true;

			var node = $(this),
			    validate = (state ? node.attr('data-validate-'+state) : node.attr('data-validate'));
			if (!validate) validate = node.attr('data-validate');
			if (!validate) return true;

			validate = validate.replace(/\s+/, ' ').split(' ');
			if (validate.length < 1) return true;

			for (var i = 0; i < validate.length; i++) {
				var ops = validate[i].split(':');
				if (!ops || ops.length < 1) continue;

				switch (ops[0]) {
					case 'required':
					case 'date':
					case 'number':
					case 'regexp':
						node.trigger(ops[0], ops);
						break;
					default:
						node.trigger('compare', ops);
						break;
				}

				if (!validateStatus) {
					node.trigger('invalid');
					return true;
				}
			}

			node.trigger('valid');
			return true;
		})
		/* CHANGE and SUBMIT: trigger validation */
		.on('change.validate', 'select, input, textarea', function(){
			$(this).trigger('validate', ['change']);
			$(this).parents('form').addClass('changed');
		})
		.on('submit.validate', 'form', function(event){
			var fields = $('select,input,textarea', $(this));

			fields.trigger('validate', ['submit']);

			if (fields.filter('.invalid').length > 0) return false;
			else $(this).removeClass('changed');
		})
	;

	$(window).on('beforeunload.validate', function(){
		var changed = $('form.changed[data-validate="submitted"]');
		if (changed.length > 0) {
			var txt = '',
			    dtxt = '';
			changed.each(function(){
				var t = $(this).attr('data-validate-error-text');
				if (t) txt += t + "\n";
				else dtxt = "Any data changed forms may not have been saved.\n";
			});
			if (txt || dtxt) return dtxt + txt;
		}
	});

});

})(jQuery);
