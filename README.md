Khaus JS
=======
**Componentes de Khaus compatibles con Laravel 5**

#### Dependencias
* jquery
* lesshat
* jquery-form
* jquery-deparam


#### Instalación

* Bower
```bash
$ bower install khausjs --save
```

Inserta este código justo antes de la etiqueta `</body>` en el layout de tu proyecto

```javascript
<script>
window.khaus = {
    token : "{!! csrf_token() !!}",
    form : "{!! old('_name') !!}",
    errors : {!! $errors->toJson() !!},
    warning : "{!! Session::get('khausWarning') !!}",
    danger : "{!! Session::get('khausDanger') !!}",
    success : "{!! Session::get('khausSuccess') !!}",
    info : "{!! Session::get('khausInfo') !!}",
    redirect : "{!! Session::get('khausRedirect') !!}",
}
window.baseURL = "{!! URL::to('/') !!}/";
window.segment = ["{!! implode('", "', Request::segments()) !!}"];
</script>
```
