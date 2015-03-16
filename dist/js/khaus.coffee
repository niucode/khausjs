do ($=jQuery) ->
    # ===== MULTIUPLOADER DE IMAGENES =====
    # Transforma un input file en un uploader multiple de imagenes con preview
    $.fn.khausImageUploader = ()->
        $.each @, (key, div)->
            images = $(div).find('img.khaus-uploaded-thumb')
            images.on 'click', ()->
                filename = $(@).attr('src').split('/').pop()
                $('<input>', type:'hidden', name:'khaus_delete_thumb[]', value:filename).appendTo div
                $(@).remove()
            input = $(div).find(':input[type=file]')
            inputName = input.attr 'name'
            input.removeAttr 'name'
            input.on 'change', (ev)->
                if $(@).val()
                    $.each ev.target.files, (key, value)->
                        if value.type.match('image.*')
                            reader = new FileReader()
                            reader.onload = ((file)->
                                return (e)->
                                    id = btoa($.now())
                                    id = id.replace(/[^a-z]+/ig, '')
                                    $('<input>', 
                                        'class':id
                                        'type':'hidden'
                                        'name':inputName + '[]'
                                        'value':e.target.result
                                    ).prependTo div
                                    $('<img>', 
                                        'class':'khaus-upload-thumb'
                                        'src':e.target.result
                                    ).on('click', ()->
                                        $('input.' + id + '').remove()
                                        $(@).remove()
                                    ).prependTo div
                            )(value)
                        reader.readAsDataURL(value);
                    $(@).val ''

    # ===== LIMPIA LOS ERRORES DEL FORMULARIO BOOTSTRAP =====
    # @param DOMElement form - formulario
    $.khausCleanFormErrors = (form) ->
        $(form).find(".form-group").removeClass "has-error has-feedback"
        $(form).find("span.form-control-feedback").remove()
        $(form).find("span.help-block").remove()
        $(form).find(":input").tooltip "destroy"

    # ===== DESPLIEGA LOS ERRORES DE FORMULARIO =====
    # @param string type (block|tooltip) forma de mostrar errores
    # @param DOMElement form - formulario que realizo el envio
    # @param object errors - errores {'inputName':'Error Message'}
    #
    # En caso de que no se envie el parametro errors, buscara esos datos
    # dentro de la variable global khaus
    $.khausDisplayFormErrors = (type, form, errors)->
        err = errors or window.khaus.errors
        counter = 0
        $.each err, (key, value)->
            counter++
            input = $(form).find(":input[name=#{key}]")
            if input.size() isnt 1 # si no lo encuentra busca inputs array[]
                input = $(form).find(":input[name^='#{key}[']")
            input.parents('.form-group').addClass "has-error"
            # si el input se encuentra dentro del un formulario tabulado
            inTab = input.parents('.tab-content')
            if inTab.size() > 0
                if counter is 1
                    $('ul.nav-tabs .badge').remove()
                page = input.parents('.tab-pane')
                pageName = page.attr 'id'
                #if not page.hasClass 'active'
                tab = $("ul.nav-tabs a[href=##{pageName}]")
                badge = tab.find '.badge'
                if badge.length is 0
                    badge = $('<span>', 'class':'badge').text 0
                    badge.appendTo tab
                badge.text parseInt(badge.text()) + 1
            switch type
                when 'block'
                    $("<span>", "class":"help-block").html(value).insertAfter input
                when 'tooltip'
                    input.tooltip(
                        placement : "top"
                        title     : value
                        container : "body"
                    )

    # ===== DESPLEGA UNA ALARTA O NOTIFICACION FLOTANTE =====
    # @param string title - titulo de la notificacion
    # @param string message - mensaje de la notificacion
    # @param object settings {
    #   delay : (int) tiempo en milisegundos que permanecera la alerta en pantalla
    #   template : (string) apariencia bootstrap default|primary|success|info|danger|warning
    #   icon : (string) icono de la alerta req. Font Awesome ex: fa-plus
    # }
    $.khausNotify = (title, message, settings) ->
        o = $.extend
            delay : 10000
            template: "default"
            icon : null
        , settings
        container = $(".khaus-notify-container")
        if container.size() == 0
            container = $("<div>", "class":"khaus-notify-container").prependTo "body"
        notify = $("<div>", "class":"khaus-notify khaus-notify-#{o.template}")
        if o.icon isnt null
            icon =  $("<i>", "class":"fa fa-fw #{o.icon}")
            icon_cont = $("<div>", class:"icon-container").html icon
            notify.append icon_cont
        message_cont = $("<div>", class:"text-container")
        message_title = $("<div>", class:"title").html(title).appendTo message_cont
        message = $("<div>").html(message).appendTo message_cont
        notify.append message_cont
        notify.appendTo container
        notify.on "click", ->
            $(@).removeClass "khaus-notify-show"
            $(@).addClass "khaus-notify-hide"
            $(@).one "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", ->
                $(@).remove()
        setTimeout ->
            notify.addClass "khaus-notify-show"
            setTimeout ->
                notify.trigger "click"
            , o.delay
        , 1

    # ===== MUESTRA LOS ERRORES ALMACENADOS EN LAS VARIABLES KHAUS ======
    $.khausLaunchFormErrors = ()->
        if !!window.khaus.errors and !!window.khaus.form
            form = $("form[name=#{window.khaus.form}]")
            $.khausDisplayFormErrors('block', form)

    # ===== =====
    $.khausLaunchAlerts = (settings) ->
        o = $.extend
            title : 
                default : ""
                primary : ""
                success : "El proceso ha finalizado"
                danger  : "Ha ocurrido un error"
                warning : "Importante"
                info    : "Informaci&oacute;n"
        , settings
        if !!window.khaus.warning
            $.khausNotify(o.title.warning, window.khaus.warning, {
                template : 'warning'
            })
        if !!window.khaus.danger
            $.khausNotify(o.title.danger, window.khaus.danger, {
                template : 'danger'
            })
        if !!window.khaus.success
            $.khausNotify(o.title.success, window.khaus.success, {
                template : 'success'
            })
        if !!window.khaus.info
            $.khausNotify(o.title.info, window.khaus.info, {
                template : 'info'
            })
        
    $.khausAjaxWait = (settings)->
        o = $.extend
            type : 'cursor'
        , settings
        switch o.type
            when 'cursor'
                $.ajaxSetup
                    beforeSend : ()->
                        $('body').addClass 'khaus-ajax-wait'
                    complete : ()->
                        $('body').removeClass 'khaus-ajax-wait'
                    success : ()->
                        $('body').removeClass 'khaus-ajax-wait'

    # ===== ADJUNTA AL FORMULARIO EL PARAMETRO NAME =====
    # Si el formulario tiene el atributo [name] activado 
    # antes de realizar el envio de los parametros
    # agrega un input hidden name="_name" value="<nombre del formulario>"
    $.fn.khausAttachName = ()->
        $.each @, ()->
            $(@).on 'submit', (ev)->
                if $(@).is('[name]') and $(@).find('input[name=_name]').size() is 0
                    $('<input>', 
                        'name':'_name'
                        'type':'hidden'
                        'value':$(@).attr('name')
                    ).prependTo($(@))

    # ===== CAPTURA EL EVENTO SUBMIT Y ENVIA UN MODAL KHAUS CONFIRM =====
    # @param object settings {
    #   title : (string) - titulo de la ventana modal
    #   message : (string) - mensaje de la ventana modal
    # }
    # Al presionar el boton aceptar del modal se realizara el submit del formulario
    # de lo contrario no se realizara ninguna accion
    $.fn.khausConfirmBeforeSubmit = (settings)->
        o = $.extend
            title   : ""
            message : ""
        , settings
        $.each @, ()->
            $(@).on 'submit', (ev)->
                ev.preventDefault()
                e = $(@)
                $.khausConfirm o.title, o.message, ->
                    e.off 'submit'
                    e.submit()


    $.khausAlert = (title, message) ->
        if $(".khaus-modal-alert").size() > 0
            $(".khaus-modal-alert").remove()
        modal_D1 = $("<div>", "class":"modal fade khaus-modal-alert")
        modal_D2 = $("<div>", "class":"modal-dialog").appendTo modal_D1
        modal_D3 = $("<div>", "class":"modal-content").appendTo modal_D2
        modal_header = $("<div>", "class":"modal-header").appendTo modal_D3
        $("<h4>", "class":"modal-title").html(title).appendTo modal_header
        modal_body = $("<div>", "class":"modal-body").html(message).appendTo modal_D3
        modal_footer = $("<div>", "class":"modal-footer").appendTo modal_D3
        $("<button>", "type":"button", "class":"btn btn-primary", "data-dismiss":"modal").html("Aceptar").appendTo modal_footer
        modal_D1.modal "show"

    $.khausPrompt = (title, message, defaultValue = "", callback = ->) ->
        if $(".khaus-modal-prompt").size() > 0
            $(".khaus-modal-prompt").remove()
        modal_D1 = $("<div>", "class":"modal fade khaus-modal-prompt")
        modal_D2 = $("<div>", "class":"modal-dialog").appendTo modal_D1
        modal_D3 = $("<div>", "class":"modal-content").appendTo modal_D2
        modal_header = $("<div>", "class":"modal-header").appendTo modal_D3
        $("<h4>", "class":"modal-title").html(title).appendTo modal_header
        modal_body = $("<div>", "class":"modal-body").appendTo modal_D3
        $("<h5>").css("font-weight":"bold").html(message).appendTo modal_body
        input_prompt = $("<input>", "type":"text", "class":"form-control").val(defaultValue).appendTo modal_body
        modal_footer = $("<div>", "class":"modal-footer").appendTo modal_D3
        $("<button>", "type":"button", "class":"btn btn-default", "data-dismiss":"modal").html("Cancelar").appendTo modal_footer
        $("<button>", "type":"button", "class":"btn btn-primary", "data-dismiss":"modal")
            .html("Aceptar")
            .on "click", ->
                callback input_prompt.val()
                return
            .appendTo modal_footer
        modal_D1.modal "show"
        setTimeout -> 
            input_prompt.select()
        , 200


    $.khausConfirm = (title, message, callback = ->) ->
        if $(".khaus-modal-confirm").size() > 0
            $(".khaus-modal-confirm").remove()
        modal_D1 = $("<div>", "class":"modal fade khaus-modal-confirm")
        modal_D2 = $("<div>", "class":"modal-dialog").appendTo modal_D1
        modal_D3 = $("<div>", "class":"modal-content").appendTo modal_D2
        modal_header = $("<div>", "class":"modal-header").appendTo modal_D3
        $("<h4>", "class":"modal-title").html(title).appendTo modal_header
        modal_body = $("<div>", "class":"modal-body").html(message).appendTo modal_D3
        modal_footer = $("<div>", "class":"modal-footer").appendTo modal_D3
        $("<button>", "type":"button", "class":"btn btn-default", "data-dismiss":"modal").html("Cancelar").appendTo modal_footer
        $("<button>", "type":"button", "class":"btn btn-primary", "data-dismiss":"modal")
            .html("Aceptar")
            .on "click", ->
                callback()
                return
            .appendTo modal_footer
        modal_D1.modal "show"

    # ===== CAMBIA EL FUNCIONAMIENTO DE LOS FORMULARIOS POR PETICIONES AJAX =====
    # 
    $.fn.khausForm = (settings)->
        o = $.extend
            errors : 'block' # block|tooltip
            reload : true
        , settings
        $.each @, ()->
            form = $(@)
            form.on 'submit', (ev)->
                form.ajaxForm
                    delegation: true
                    success: (response, status, xhr, $form)->
                        if o.reload
                            window.location.reload()
                    error: (response, status, xhr, $form)->
                        $.khausCleanFormErrors($form)
                        if typeof response.responseJSON isnt 'undefined'
                            errors = response.responseJSON
                        else
                            errors = $.parseJSON(response.responseText)
                        $.each errors, (key, value)->
                            if key.match /^khaus/
                                key = key.replace('khaus', '').toLowerCase()
                                if typeof window.khaus[key] isnt 'undefined'
                                    window.khaus[key] = value
                        $.khausLaunchAlerts()
                        $.khausDisplayFormErrors(o.errors, $form, errors)

    $.fn.khausNumberFormat = ()->
        replace = (number)->
            number = number.replace /[^0-9]+/g, ''
            number = number.replace /\B(?=(\d{3})+(?!\d))/g, '.'
        @each ()->
            if $(this).is(':input')
                number = replace $(this).val()
                $(this).val(number)
            else
                number = replace $(this).html()
                $(this).html(number)

    $.fn.khausLoadSelect = (settings)->
        o = $.extend
            url : $(@).data 'khaus-url'
            select : $(@).data 'khaus-select'
        , settings
        @each ->
            $(@).on 'change', ->
                select = $(o.select)
                select.attr 'disabled', true
                select.text ''
                $.get o.url, value:$(@).val(), (r)->
                    $.each r, ->
                        $('<option>', value:@id).text(@nombre).appendTo select
                    select.removeAttr 'disabled'

$(document).ready ->
    $('form').khausAttachName()
    $.khausLaunchFormErrors()
    $.khausLaunchAlerts()
    $('form.khaus-form').khausForm()