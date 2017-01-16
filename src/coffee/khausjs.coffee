do ($=jQuery) ->

    ### LIMPIA LOS ERRORES DEL FORMULARIO BOOTSTRAP
    # ==========================================================================
    # @param DOMElement form - formulario
    # ==========================================================================
    ###
    $.khausCleanFormErrors = (form) ->
        $(form).find(".form-group").removeClass "has-error has-feedback"
        $(form).find("span.form-control-feedback").remove()
        $(form).find("span.help-block").remove()
        $(form).find(":input").tooltip "destroy"


    ### DESPLIEGA LOS ERRORES DE FORMULARIO
    # ==========================================================================
    # @param string type (block|tooltip) forma de mostrar errores
    # @param DOMElement form - formulario que realizo el envio
    # @param object errors - errores {'inputName':'Error Message'}
    #
    # En caso de que no se envie el parametro errors, buscara esos datos
    # dentro de la variable global khaus
    # ==========================================================================
    ###
    $.khausDisplayFormErrors = (settings)->
        o = $.extend
            errorsType : 'block'
            form : null
            errors : window.khaus.errors
            resetForm : false
        , settings
        counter = 0
        $.each o.errors, (key, value)->
            if key.match /^khaus/
                key = key.replace('khaus', '').toLowerCase()
                if typeof window.khaus[key] isnt 'undefined'
                    window.khaus[key] = value
                    return true
            if arr = key.match /\.([^.]+)/
                key = key.replace(arr[0], "[#{arr[1]}]")
            counter++
            input = $(o.form).find(":input[name='#{key}']")
            # if input.size() isnt 1 # si no lo encuentra busca inputs array[]
            #    input = $(o.form).find(":input[name^='#{key}[']")
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
            switch o.errorsType
                when 'block'
                    pos = input.parents '.form-group'
                    $("<span>", "class":"help-block").html(value).appendTo pos
                when 'tooltip'
                    input.tooltip(
                        placement : "top"
                        title     : value
                        container : "body"
                    )
        $.khausLaunchAlerts()
        if counter is 0
            if o.resetForm
                $(o.form)[0].reset()


    ### MUESTRA LOS ERRORES ALMACENADOS EN LAS VARIABLES KHAUS
    # ==========================================================================
    #
    # ==========================================================================
    ###
    $.khausLaunchFormErrors = ()->
        if !!window.khaus.errors and !!window.khaus.form
            form = $("form[name=#{window.khaus.form}]")
            $.khausDisplayFormErrors(
                errorsType: 'block'
                form: form
            )

    ###
    # ==========================================================================
    #
    # ==========================================================================
    ###
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
        $.each o.title, (key, value)->
            if !!window.khaus[key]
                template = key
                if key is 'default'
                    template = 'alert'
                if key is 'danger'
                    template = 'error'
                if key is 'info'
                    template = 'information'
                if $.isPlainObject(window.khaus[key]) or $.isArray(window.khaus[key])
                    $.each window.khaus[key], (k, mensaje)->
                        n = noty(
                            text: mensaje
                            type: template
                        )
                else
                    n = noty(
                        text: window.khaus[key]
                        type: template
                    )
                window.khaus[key] = ''

    ###
    # ==========================================================================
    #
    # ==========================================================================
    ###
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




    ### ADJUNTA AL FORMULARIO EL PARAMETRO NAME
    # ==========================================================================
    # Si el formulario tiene el atributo [name] activado
    # antes de realizar el envio de los parametros
    # agrega un input hidden name="_name" value="<nombre del formulario>"
    # ==========================================================================
    ###
    $.fn.khausAttachName = ()->
        $.each @, ()->
            $(@).on 'submit', (ev)->
                if $(@).is('[name]') and $(@).find('input[name=_name]').size() is 0
                    $('<input>',
                        'name':'_name'
                        'type':'hidden'
                        'value':$(@).attr('name')
                    ).prependTo($(@))


    ### CAPTURA EL EVENTO SUBMIT Y ENVIA UN MODAL KHAUS CONFIRM
    # ==========================================================================
    # @param object settings {
    #   title : (string) - titulo de la ventana modal
    #   message : (string) - mensaje de la ventana modal
    # }
    # Al presionar el boton aceptar del modal se realizara el submit del formulario
    # de lo contrario no se realizara ninguna accion
    # ==========================================================================
    ###
    $.fn.khausConfirmBeforeSubmit = ->
        $.each @, ->
            title = $(@).data 'khaus-title' || ''
            message = $(@).data 'khaus-confirm' || ''
            $(@).on 'submit', (ev)->
                $(':focus').blur()
                ev.preventDefault()
                e = $(@)
                $.khausConfirm title, message, ->
                    e.off 'submit'
                    e.submit()


    ###
    # ==========================================================================
    # Envia un modal de alerta con las opciones aceptar y cancelar
    # Metodos de llamada:
    # - por codigo: $.khausAlert('Titulo', 'Mensaje');
    # - por dom: <button data-khaus-alert="Mensaje" data-khaus-title="Opcional">
    # El titulo es opcional en la llamada por dom
    # ==========================================================================
    ###
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

    $.fn.khausAlert = ->
        @each ->
            $(@).on 'click', (ev)->
                message = $(@).data 'khaus-alert'
                title = $(@).data 'khaus-title' || ''
                $.khausAlert(title, message)

    ###
    # ==========================================================================
    #
    # ==========================================================================
    ###
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

    ###
    # ==========================================================================
    #
    # ==========================================================================
    ###
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
        btnAceptar = $("<button>", "type":"button", "class":"btn btn-primary", "data-dismiss":"modal")
            .html("Aceptar")
            .on "click", ->
                callback()
                return
            .appendTo modal_footer
        setTimeout(->
            btnAceptar.focus()
        , 300)
        modal_D1.modal "show"


    ### CAMBIA EL FUNCIONAMIENTO DE LOS FORMULARIOS POR PETICIONES AJAX
    # ==========================================================================
    #
    # ==========================================================================
    ###
    $.fn.khausForm = (settings)->
        o = $.extend(
            onSubmit: ->
            onSuccess: ->
            onError: ->
        , settings)
        $.each @, ()->
            form = $(@)
            form.on 'submit', (ev)->
                o.onSubmit(form, ev);
                form.ajaxForm
                    delegation: true
                    success: (response, status, xhr, $form)->
                        $.each response, (key, value)->
                            if key.match /^khaus/
                                key = key.replace('khaus', '').toLowerCase()
                                if typeof window.khaus[key] isnt 'undefined'
                                    window.khaus[key] = value
                        $.khausLaunchAlerts()
                        if window.khaus.redirect isnt null
                            if form.data('khaus-reset') || false
                                $($form)[0].reset()
                            if $.isArray(window.khaus.redirect)
                                setTimeout(->
                                    location = window.khaus.redirect[0]
                                    if not location.match(/^http:\/\//i)
                                        location = window.baseURL + location;
                                    window.location = location
                                , window.khaus.redirect[1])
                            else if $.isPlainObject(window.khaus.redirect)
                                $.each window.khaus.redirect, (url, tiempo)->
                                    setTimeout(->
                                        location = url
                                        if not location.match(/^http:\/\//i)
                                            location = window.baseURL + location;
                                        window.location = location
                                    , tiempo)
                            else
                                location = window.khaus.redirect
                                if not location.match(/^http:\/\//i)
                                    location = window.baseURL + location;
                                window.location = location
                        o.onSuccess($form, ev, response)
                    error: (response, status, xhr, $form)->
                        $.khausCleanFormErrors($form)
                        if typeof response.responseJSON isnt 'undefined'
                            errors = response.responseJSON
                        else
                            errors = $.parseJSON(response.responseText)
                        $.khausDisplayFormErrors(
                            errorsType: form.data('khaus-errortype') || 'block'
                            form: $form
                            errors: errors
                            resetForm: form.data('khaus-reset') || false
                        )
                        o.onError($form, ev, response)



    ###
    # ==========================================================================
    #
    # ==========================================================================
    ###
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


    ###
    # ==========================================================================
    #
    # ==========================================================================
    ###
    $.khausLoadSelect = ($select, url, fk, selected)->
        $select.attr 'disabled', true
        $select.text ''
        $.get "#{window.baseURL}#{url}/#{fk}.json", (r)->
            $.each r, ->
                $('<option>', value:@id).text(@nombre).appendTo $select
            $select.removeAttr 'disabled'
            if $select.find("option[value=#{selected}]").size() > 0
                $select.val selected
            else
                $select.val($select.find('option:first').attr('value'))

    $.fn.khausLoadSelect = (settings)->
        o = $.extend
            url : $(@).data 'khaus-url'
            select : $(@).data 'khaus-select'
            selected : $(@).data 'khaus-selected' or 1
        , settings
        @each ->
            $select = $(o.select)
            if @value
                $.khausLoadSelect $select, o.url, @value, o.selected
            else
                $select.text ''
                $select.attr 'disabled', true
            $(@).on 'change', ->
                $.khausLoadSelect $select, o.url, @value, o.selected

    ###
    # ==========================================================================
    #
    # ==========================================================================
    ###
    $.fn.khausClone = ->
        @each ->
            $(@).on 'click', (ev)->
                ev.preventDefault()
                selector = $(@).data 'khaus-clone'
                target = $(selector).last()
                clon = target.clone()
                clon.find(':input[name]').each ->
                    name = $(@).attr('name')
                    key = name.match(/\[(\d+)\]/)
                    if !!key
                        key = parseInt key[1]
                        newName = name.replace "[#{key}]", "[#{key+1}]"
                        $(@).attr 'name', newName
                clon.find('input').val ''
                clon.find('select option:first').attr 'selected', true
                clon.find(':button[data-khaus-removeparent]').khausRemoveParent()
                clon.insertAfter target


    ###
    # ==========================================================================
    #
    # ==========================================================================
    ###
    $.fn.khausRemoveParent = ->
        @each ->
            $(@).on 'click', (ev)->
                ev.preventDefault()
                selector = $(@).data 'khaus-removeparent'
                target = $(this).parents(selector)
                target.remove()



$ ->
    # noty defaults options
    $.noty.defaults.theme = 'relax'
    $.noty.defaults.layout = 'bottomRight'
    $.noty.defaults.timeout = 8000
    $.noty.defaults.animation.open = 'animated bounceInRight'
    $.noty.defaults.animation.close = 'animated bounceOutRight'

    $('form').khausAttachName()
    $.khausLaunchFormErrors()
    $.khausLaunchAlerts()
    $('form.khaus-form').khausForm()
    $('form[data-khaus-confirm]').khausConfirmBeforeSubmit()
    $(':button[data-khaus-clone]').khausClone()
    $(':button[data-khaus-removeparent]').khausRemoveParent()
    $(':button[data-khaus-alert]').khausAlert()
    $('.khaus-numero').khausNumberFormat()
    $('select[data-khaus-select]').khausLoadSelect();
