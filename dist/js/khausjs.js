(function($) {

  /* MULTIUPLOADER DE IMAGENES
   * ==========================================================================
   * Transforma un input file en un uploader multiple de imagenes con preview
   * ==========================================================================
   */
  $.fn.khausImageUploader = function() {
    return $.each(this, function(key, div) {
      var images, input, inputName;
      images = $(div).find('img.khaus-uploaded-thumb');
      images.on('click', function() {
        var filename;
        filename = $(this).attr('src').split('/').pop();
        $('<input>', {
          type: 'hidden',
          name: 'khaus_delete_thumb[]',
          value: filename
        }).appendTo(div);
        return $(this).remove();
      });
      input = $(div).find(':input[type=file]');
      inputName = input.attr('name');
      input.removeAttr('name');
      return input.on('change', function(ev) {
        if ($(this).val()) {
          $.each(ev.target.files, function(key, value) {
            var reader;
            if (value.type.match('image.*')) {
              reader = new FileReader();
              reader.onload = (function(file) {
                return function(e) {
                  var id;
                  id = btoa($.now());
                  id = id.replace(/[^a-z]+/ig, '');
                  $('<input>', {
                    'class': id,
                    'type': 'hidden',
                    'name': inputName + '[]',
                    'value': e.target.result
                  }).prependTo(div);
                  return $('<img>', {
                    'class': 'khaus-upload-thumb',
                    'src': e.target.result
                  }).on('click', function() {
                    $('input.' + id + '').remove();
                    return $(this).remove();
                  }).prependTo(div);
                };
              })(value);
            }
            return reader.readAsDataURL(value);
          });
          return $(this).val('');
        }
      });
    });
  };

  /* LIMPIA LOS ERRORES DEL FORMULARIO BOOTSTRAP
   * ==========================================================================
   * @param DOMElement form - formulario
   * ==========================================================================
   */
  $.khausCleanFormErrors = function(form) {
    $(form).find(".form-group").removeClass("has-error has-feedback");
    $(form).find("span.form-control-feedback").remove();
    $(form).find("span.help-block").remove();
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
      var badge, inTab, input, page, pageName, pos, tab;
      if (key.match(/^khaus/)) {
        key = key.replace('khaus', '').toLowerCase();
        if (typeof window.khaus[key] !== 'undefined') {
          window.khaus[key] = value;
          return true;
        }
      }
      counter++;
      input = $(o.form).find(":input[name=" + key + "]");
      if (input.size() !== 1) {
        input = $(o.form).find(":input[name^='" + key + "[']");
      }
      input.parents('.form-group').addClass("has-error");
      inTab = input.parents('.tab-content');
      if (inTab.size() > 0) {
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
          return $("<span>", {
            "class": "help-block"
          }).html(value).appendTo(pos);
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

  /* DESPLEGA UNA ALARTA O NOTIFICACION FLOTANTE
   * ==========================================================================
   * @param string title - titulo de la notificacion
   * @param string message - mensaje de la notificacion
   * @param object settings {
   *   delay : (int) tiempo en milisegundos que permanecera la alerta en pantalla
   *   template : (string) apariencia bootstrap default|primary|success|info|danger|warning
   *   icon : (string) icono de la alerta req. Font Awesome ex: fa-plus
   * }
   * ==========================================================================
   */
  $.khausNotify = function(title, message, settings) {
    var container, icon, icon_cont, message_cont, message_title, notify, o;
    o = $.extend({
      delay: 10000,
      template: "default",
      icon: null
    }, settings);
    container = $(".khaus-notify-container");
    if (container.size() === 0) {
      container = $("<div>", {
        "class": "khaus-notify-container"
      }).prependTo("body");
    }
    notify = $("<div>", {
      "class": "khaus-notify khaus-notify-" + o.template
    });
    if (o.icon !== null) {
      icon = $("<i>", {
        "class": "fa fa-fw " + o.icon
      });
      icon_cont = $("<div>", {
        "class": "icon-container"
      }).html(icon);
      notify.append(icon_cont);
    }
    message_cont = $("<div>", {
      "class": "text-container"
    });
    message_title = $("<div>", {
      "class": "title"
    }).html(title).appendTo(message_cont);
    message = $("<div>").html(message).appendTo(message_cont);
    notify.append(message_cont);
    notify.appendTo(container);
    notify.on("click", function() {
      $(this).removeClass("khaus-notify-show");
      $(this).addClass("khaus-notify-hide");
      return $(this).one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function() {
        return $(this).remove();
      });
    });
    return setTimeout(function() {
      notify.addClass("khaus-notify-show");
      return setTimeout(function() {
        return notify.trigger("click");
      }, o.delay);
    }, 1);
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
      if (!!window.khaus[key]) {
        if ($.isArray(window.khaus[key])) {
          $.khausNotify(window.khaus[key][0], window.khaus[key][1], {
            template: key
          });
        } else if ($.isPlainObject(window.khaus[key])) {
          $.each(window.khaus[key], function(titulo, mensaje) {
            return $.khausNotify(titulo, mensaje, {
              template: key
            });
          });
        } else {
          $.khausNotify(value, window.khaus[key], {
            template: key
          });
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
        if ($(this).is('[name]') && $(this).find('input[name=_name]').size() === 0) {
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
    if ($(".khaus-modal-alert").size() > 0) {
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
    if ($(".khaus-modal-prompt").size() > 0) {
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
    if ($(".khaus-modal-confirm").size() > 0) {
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
    return $.each(this, function() {
      var form;
      form = $(this);
      return form.on('submit', function(ev) {
        return form.ajaxForm({
          delegation: true,
          success: function(response, status, xhr, $form) {
            var location, ref;
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
                return setTimeout(function() {
                  var location, ref;
                  location = window.khaus.redirect[0];
                  location = (ref = location.match(/^http:\/\//i)) != null ? ref : {
                    location: window.baseURL + location
                  };
                  return window.location = location;
                }, window.khaus.redirect[1]);
              } else if ($.isPlainObject(window.khaus.redirect)) {
                return $.each(window.khaus.redirect, function(url, tiempo) {
                  return setTimeout(function() {
                    var location, ref;
                    location = url;
                    location = (ref = location.match(/^http:\/\//i)) != null ? ref : {
                      location: window.baseURL + location
                    };
                    return window.location = location;
                  }, tiempo);
                });
              } else {
                location = window.khaus.redirect;
                location = (ref = location.match(/^http:\/\//i)) != null ? ref : {
                  location: window.baseURL + location
                };
                return window.location = location;
              }
            }
          },
          error: function(response, status, xhr, $form) {
            var errors;
            $.khausCleanFormErrors($form);
            if (typeof response.responseJSON !== 'undefined') {
              errors = response.responseJSON;
            } else {
              errors = $.parseJSON(response.responseText);
            }
            return $.khausDisplayFormErrors({
              errorsType: form.data('khaus-errortype') || 'block',
              form: $form,
              errors: errors,
              resetForm: form.data('khaus-reset') || false
            });
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
      if ($select.find("option[value=" + selected + "]").size() > 0) {
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

$(document).ready(function() {
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
