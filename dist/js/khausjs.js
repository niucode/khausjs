(function($) {

  /* LIMPIA LOS ERRORES DEL FORMULARIO BOOTSTRAP
   * ==========================================================================
   * @param DOMElement form - formulario
   * ==========================================================================
   */
  $.khausCleanFormErrors = function(form) {
    $(form).find(".form-group").removeClass("has-error has-feedback");
    $(form).find("span.form-control-feedback").remove();
    $(form).find("span.help-block").remove();
    $(form).find("span.form-control-feedback").remove();
    return $(form).find(":input").tooltip("destroy");
  };

  /* DESPLIEGA LOS ERRORES DE FORMULARIO
   * ==========================================================================
   * @param string type (block|tooltip) forma de mostrar errores
   * @param DOMElement form - formulario que realizo el envio
   * @param object errors - errores {'inputName':'Error Message'}
   *
   * En caso de que no se envie el parametro errors, buscara esos datos
   * dentro de la variable global khaus
   * ==========================================================================
   */
  $.khausDisplayFormErrors = function(settings) {
    var counter, o;
    o = $.extend({
      errorsType: 'block',
      form: null,
      errors: window.khaus.errors,
      resetForm: false
    }, settings);
    counter = 0;
    $.each(o.errors, function(key, value) {
      var arr, badge, inTab, input, page, pageName, pos, tab;
      if (key.match(/^khaus/)) {
        key = key.replace('khaus', '').toLowerCase();
        if (typeof window.khaus[key] !== 'undefined') {
          window.khaus[key] = value;
          return true;
        }
      }
      if (arr = key.match(/\.([^.]+)/)) {
        key = key.replace(arr[0], "[" + arr[1] + "]");
      }
      counter++;
      input = $(o.form).find(":input[name='" + key + "']");
      input.parents('.form-group').addClass("has-error");
      input.parents('.form-group').addClass("has-feedback");
      inTab = input.parents('.tab-content');
      if (inTab.length > 0) {
        if (counter === 1) {
          $('ul.nav-tabs .badge').remove();
        }
        page = input.parents('.tab-pane');
        pageName = page.attr('id');
        tab = $("ul.nav-tabs a[href=#" + pageName + "]");
        badge = tab.find('.badge');
        if (badge.length === 0) {
          badge = $('<span>', {
            'class': 'badge'
          }).text(0);
          badge.appendTo(tab);
        }
        badge.text(parseInt(badge.text()) + 1);
      }
      switch (o.errorsType) {
        case 'block':
          pos = input.parents('.form-group');
          $("<span>", {
            "class": "help-block"
          }).html(value).appendTo(pos);
          return $("<span>", {
            "class": "glyphicon glyphicon-remove form-control-feedback"
          }).appendTo(pos);
        case 'tooltip':
          return input.tooltip({
            placement: "top",
            title: value,
            container: "body"
          });
      }
    });
    $.khausLaunchAlerts();
    if (counter === 0) {
      if (o.resetForm) {
        return $(o.form)[0].reset();
      }
    }
  };

  /* MUESTRA LOS ERRORES ALMACENADOS EN LAS VARIABLES KHAUS
   * ==========================================================================
   *
   * ==========================================================================
   */
  $.khausLaunchFormErrors = function() {
    var form;
    if (!!window.khaus.errors && !!window.khaus.form) {
      form = $("form[name=" + window.khaus.form + "]");
      return $.khausDisplayFormErrors({
        errorsType: 'block',
        form: form
      });
    }
  };

  /*
   * ==========================================================================
   *
   * ==========================================================================
   */
  $.khausLaunchAlerts = function(settings) {
    var o;
    o = $.extend({
      title: {
        "default": "",
        primary: "",
        success: "El proceso ha finalizado",
        danger: "Ha ocurrido un error",
        warning: "Importante",
        info: "Informaci&oacute;n"
      }
    }, settings);
    return $.each(o.title, function(key, value) {
      var template;
      if (!!window.khaus[key]) {
        template = key;
        if (key === 'default') {
          template = 'alert';
        }
        if (key === 'danger') {
          template = 'error';
        }
        if (key === 'info') {
          template = 'info';
        }
        if ($.isPlainObject(window.khaus[key]) || $.isArray(window.khaus[key])) {
          $.each(window.khaus[key], function(k, mensaje) {
            return new Noty({
              text: mensaje,
              type: template
            }).show();
          });
        } else {
          new Noty({
            text: window.khaus[key],
            type: template
          }).show();
        }
        return window.khaus[key] = '';
      }
    });
  };

  /*
   * ==========================================================================
   *
   * ==========================================================================
   */
  $.khausAjaxWait = function(settings) {
    var o;
    o = $.extend({
      type: 'cursor'
    }, settings);
    switch (o.type) {
      case 'cursor':
        return $.ajaxSetup({
          beforeSend: function() {
            return $('body').addClass('khaus-ajax-wait');
          },
          complete: function() {
            return $('body').removeClass('khaus-ajax-wait');
          },
          success: function() {
            return $('body').removeClass('khaus-ajax-wait');
          }
        });
    }
  };

  /* ADJUNTA AL FORMULARIO EL PARAMETRO NAME
   * ==========================================================================
   * Si el formulario tiene el atributo [name] activado
   * antes de realizar el envio de los parametros
   * agrega un input hidden name="_name" value="<nombre del formulario>"
   * ==========================================================================
   */
  $.fn.khausAttachName = function() {
    return $.each(this, function() {
      return $(this).on('submit', function(ev) {
        if ($(this).is('[name]') && $(this).find('input[name=_name]').length === 0) {
          return $('<input>', {
            'name': '_name',
            'type': 'hidden',
            'value': $(this).attr('name')
          }).prependTo($(this));
        }
      });
    });
  };

  /* CAPTURA EL EVENTO SUBMIT Y ENVIA UN MODAL KHAUS CONFIRM
   * ==========================================================================
   * @param object settings {
   *   title : (string) - titulo de la ventana modal
   *   message : (string) - mensaje de la ventana modal
   * }
   * Al presionar el boton aceptar del modal se realizara el submit del formulario
   * de lo contrario no se realizara ninguna accion
   * ==========================================================================
   */
  $.fn.khausConfirmBeforeSubmit = function() {
    return $.each(this, function() {
      var message, title;
      title = $(this).data('khaus-title' || '');
      message = $(this).data('khaus-confirm' || '');
      return $(this).on('submit', function(ev) {
        var e;
        $(':focus').blur();
        ev.preventDefault();
        e = $(this);
        return $.khausConfirm(title, message, function() {
          e.off('submit');
          return e.submit();
        });
      });
    });
  };

  /*
   * ==========================================================================
   * Envia un modal de alerta con las opciones aceptar y cancelar
   * Metodos de llamada:
   * - por codigo: $.khausAlert('Titulo', 'Mensaje');
   * - por dom: <button data-khaus-alert="Mensaje" data-khaus-title="Opcional">
   * El titulo es opcional en la llamada por dom
   * ==========================================================================
   */
  $.khausAlert = function(title, message) {
    var modal_D1, modal_D2, modal_D3, modal_body, modal_footer, modal_header;
    if ($(".khaus-modal-alert").length > 0) {
      $(".khaus-modal-alert").remove();
    }
    modal_D1 = $("<div>", {
      "class": "modal fade khaus-modal-alert"
    });
    modal_D2 = $("<div>", {
      "class": "modal-dialog"
    }).appendTo(modal_D1);
    modal_D3 = $("<div>", {
      "class": "modal-content"
    }).appendTo(modal_D2);
    modal_header = $("<div>", {
      "class": "modal-header"
    }).appendTo(modal_D3);
    $("<h4>", {
      "class": "modal-title"
    }).html(title).appendTo(modal_header);
    modal_body = $("<div>", {
      "class": "modal-body"
    }).html(message).appendTo(modal_D3);
    modal_footer = $("<div>", {
      "class": "modal-footer"
    }).appendTo(modal_D3);
    $("<button>", {
      "type": "button",
      "class": "btn btn-primary",
      "data-dismiss": "modal"
    }).html("Aceptar").appendTo(modal_footer);
    return modal_D1.modal("show");
  };
  $.fn.khausAlert = function() {
    return this.each(function() {
      return $(this).on('click', function(ev) {
        var message, title;
        message = $(this).data('khaus-alert');
        title = $(this).data('khaus-title' || '');
        return $.khausAlert(title, message);
      });
    });
  };

  /*
   * ==========================================================================
   *
   * ==========================================================================
   */
  $.khausPrompt = function(title, message, defaultValue, callback) {
    var input_prompt, modal_D1, modal_D2, modal_D3, modal_body, modal_footer, modal_header;
    if (defaultValue == null) {
      defaultValue = "";
    }
    if (callback == null) {
      callback = function() {};
    }
    if ($(".khaus-modal-prompt").length > 0) {
      $(".khaus-modal-prompt").remove();
    }
    modal_D1 = $("<div>", {
      "class": "modal fade khaus-modal-prompt"
    });
    modal_D2 = $("<div>", {
      "class": "modal-dialog"
    }).appendTo(modal_D1);
    modal_D3 = $("<div>", {
      "class": "modal-content"
    }).appendTo(modal_D2);
    modal_header = $("<div>", {
      "class": "modal-header"
    }).appendTo(modal_D3);
    $("<h4>", {
      "class": "modal-title"
    }).html(title).appendTo(modal_header);
    modal_body = $("<div>", {
      "class": "modal-body"
    }).appendTo(modal_D3);
    $("<h5>").css({
      "font-weight": "bold"
    }).html(message).appendTo(modal_body);
    input_prompt = $("<input>", {
      "type": "text",
      "class": "form-control"
    }).val(defaultValue).appendTo(modal_body);
    modal_footer = $("<div>", {
      "class": "modal-footer"
    }).appendTo(modal_D3);
    $("<button>", {
      "type": "button",
      "class": "btn btn-default",
      "data-dismiss": "modal"
    }).html("Cancelar").appendTo(modal_footer);
    $("<button>", {
      "type": "button",
      "class": "btn btn-primary",
      "data-dismiss": "modal"
    }).html("Aceptar").on("click", function() {
      callback(input_prompt.val());
    }).appendTo(modal_footer);
    modal_D1.modal("show");
    return setTimeout(function() {
      return input_prompt.select();
    }, 200);
  };

  /*
   * ==========================================================================
   *
   * ==========================================================================
   */
  $.khausConfirm = function(title, message, callback) {
    var btnAceptar, modal_D1, modal_D2, modal_D3, modal_body, modal_footer, modal_header;
    if (callback == null) {
      callback = function() {};
    }
    if ($(".khaus-modal-confirm").length > 0) {
      $(".khaus-modal-confirm").remove();
    }
    modal_D1 = $("<div>", {
      "class": "modal fade khaus-modal-confirm"
    });
    modal_D2 = $("<div>", {
      "class": "modal-dialog"
    }).appendTo(modal_D1);
    modal_D3 = $("<div>", {
      "class": "modal-content"
    }).appendTo(modal_D2);
    modal_header = $("<div>", {
      "class": "modal-header"
    }).appendTo(modal_D3);
    $("<h4>", {
      "class": "modal-title"
    }).html(title).appendTo(modal_header);
    modal_body = $("<div>", {
      "class": "modal-body"
    }).html(message).appendTo(modal_D3);
    modal_footer = $("<div>", {
      "class": "modal-footer"
    }).appendTo(modal_D3);
    $("<button>", {
      "type": "button",
      "class": "btn btn-default",
      "data-dismiss": "modal"
    }).html("Cancelar").appendTo(modal_footer);
    btnAceptar = $("<button>", {
      "type": "button",
      "class": "btn btn-primary",
      "data-dismiss": "modal"
    }).html("Aceptar").on("click", function() {
      callback();
    }).appendTo(modal_footer);
    setTimeout(function() {
      return btnAceptar.focus();
    }, 300);
    return modal_D1.modal("show");
  };

  /* CAMBIA EL FUNCIONAMIENTO DE LOS FORMULARIOS POR PETICIONES AJAX
   * ==========================================================================
   *
   * ==========================================================================
   */
  $.fn.khausForm = function(settings) {
    var o;
    o = $.extend({
      onSubmit: function() {},
      onSuccess: function() {},
      onError: function() {}
    }, settings);
    return $.each(this, function() {
      var form;
      form = $(this);
      return form.on('submit', function(ev) {
        o.onSubmit(form, ev);
        return form.ajaxForm({
          delegation: true,
          success: function(response, status, xhr, $form) {
            var location;
            $.each(response, function(key, value) {
              if (key.match(/^khaus/)) {
                key = key.replace('khaus', '').toLowerCase();
                if (typeof window.khaus[key] !== 'undefined') {
                  return window.khaus[key] = value;
                }
              }
            });
            $.khausLaunchAlerts();
            if (window.khaus.redirect !== null) {
              if (form.data('khaus-reset') || false) {
                $($form)[0].reset();
              }
              if ($.isArray(window.khaus.redirect)) {
                setTimeout(function() {
                  var location;
                  location = window.khaus.redirect[0];
                  if (!location.match(/^http:\/\//i)) {
                    location = window.baseURL + location;
                  }
                  return window.location = location;
                }, window.khaus.redirect[1]);
              } else if ($.isPlainObject(window.khaus.redirect)) {
                $.each(window.khaus.redirect, function(url, tiempo) {
                  return setTimeout(function() {
                    var location;
                    location = url;
                    if (!location.match(/^http:\/\//i)) {
                      location = window.baseURL + location;
                    }
                    return window.location = location;
                  }, tiempo);
                });
              } else {
                location = window.khaus.redirect;
                if (!location.match(/^http:\/\//i)) {
                  location = window.baseURL + location;
                }
                window.location = location;
              }
            }
            return o.onSuccess($form, ev, response);
          },
          error: function(response, status, xhr, $form) {
            var m;
            $.khausCleanFormErrors($form);
            if (typeof response.responseJSON !== 'undefined') {
              m = response.responseJSON;
            } else {
              m = $.parseJSON(response.responseText);
            }
            if (m.message) {
              new Noty({
                text: m.message,
                type: 'error'
              }).show();
            }
            $.khausDisplayFormErrors({
              errorsType: form.data('khaus-errortype') || 'block',
              form: $form,
              errors: m.errors,
              resetForm: form.data('khaus-reset') || false
            });
            return o.onError($form, ev, response);
          }
        });
      });
    });
  };

  /*
   * ==========================================================================
   *
   * ==========================================================================
   */
  $.fn.khausNumberFormat = function() {
    var replace;
    replace = function(number) {
      number = number.replace(/[^0-9]+/g, '');
      return number = number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
    return this.each(function() {
      var number;
      if ($(this).is(':input')) {
        number = replace($(this).val());
        return $(this).val(number);
      } else {
        number = replace($(this).html());
        return $(this).html(number);
      }
    });
  };

  /*
   * ==========================================================================
   *
   * ==========================================================================
   */
  $.khausLoadSelect = function($select, url, fk, selected) {
    $select.attr('disabled', true);
    $select.text('');
    return $.get("" + window.baseURL + url + "/" + fk + ".json", function(r) {
      $.each(r, function() {
        return $('<option>', {
          value: this.id
        }).text(this.nombre).appendTo($select);
      });
      $select.removeAttr('disabled');
      if ($select.find("option[value=" + selected + "]").length > 0) {
        return $select.val(selected);
      } else {
        return $select.val($select.find('option:first').attr('value'));
      }
    });
  };
  $.fn.khausLoadSelect = function(settings) {
    var o;
    o = $.extend({
      url: $(this).data('khaus-url'),
      select: $(this).data('khaus-select'),
      selected: $(this).data('khaus-selected' || 1)
    }, settings);
    return this.each(function() {
      var $select;
      $select = $(o.select);
      if (this.value) {
        $.khausLoadSelect($select, o.url, this.value, o.selected);
      } else {
        $select.text('');
        $select.attr('disabled', true);
      }
      return $(this).on('change', function() {
        return $.khausLoadSelect($select, o.url, this.value, o.selected);
      });
    });
  };

  /*
   * ==========================================================================
   *
   * ==========================================================================
   */
  $.fn.khausClone = function() {
    return this.each(function() {
      return $(this).on('click', function(ev) {
        var clon, selector, target;
        ev.preventDefault();
        selector = $(this).data('khaus-clone');
        target = $(selector).last();
        clon = target.clone();
        clon.find(':input[name]').each(function() {
          var key, name, newName;
          name = $(this).attr('name');
          key = name.match(/\[(\d+)\]/);
          if (!!key) {
            key = parseInt(key[1]);
            newName = name.replace("[" + key + "]", "[" + (key + 1) + "]");
            return $(this).attr('name', newName);
          }
        });
        clon.find('input').val('');
        clon.find('select option:first').attr('selected', true);
        clon.find(':button[data-khaus-removeparent]').khausRemoveParent();
        return clon.insertAfter(target);
      });
    });
  };

  /*
   * ==========================================================================
   *
   * ==========================================================================
   */
  return $.fn.khausRemoveParent = function() {
    return this.each(function() {
      return $(this).on('click', function(ev) {
        var selector, target;
        ev.preventDefault();
        selector = $(this).data('khaus-removeparent');
        target = $(this).parents(selector);
        return target.remove();
      });
    });
  };
})(jQuery);

$(function() {
  Noty.overrideDefaults({
    layout: 'bottomRight',
    theme: 'metroui',
    timeout: 8000,
    closeWith: ['click', 'button'],
    animation: {
      open: 'animated bounceInRight',
      close: 'animated bounceOutRight'
    }
  });
  $('form').khausAttachName();
  $.khausLaunchFormErrors();
  $.khausLaunchAlerts();
  $('form.khaus-form').khausForm();
  $('form[data-khaus-confirm]').khausConfirmBeforeSubmit();
  $(':button[data-khaus-clone]').khausClone();
  $(':button[data-khaus-removeparent]').khausRemoveParent();
  $(':button[data-khaus-alert]').khausAlert();
  $('.khaus-numero').khausNumberFormat();
  return $('select[data-khaus-select]').khausLoadSelect();
});
