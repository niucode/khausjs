**Khaus JS**
=======
Componentes de Khaus compatibles con Laravel 5


----------


#### **Dependencias**
* jquery
* lesshat
* jquery-form
* jquery-deparam


----------


#### **Guía de Instalación**

- Bower
```bash
$ bower install khausjs --save
```
- Agrega la llamada a los archivos .css y .js dentro de tu archivo layout

```html
<link media="all" type="text/css" rel="stylesheet" href="../dist/css/khaus.css">
```
```html
<script src="../dist/js/khaus.js"></script>
```
- Inserta este código dentro de una etiqueta `<script>` justo antes de la etiqueta `</body>` en el layout de tu proyecto

```javascript
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
```


----------


#### **Manual de uso**
##### Características automáticas
Al momento de enviar un formulario que contenga el atributo `name`, automáticamente se agrega el parámetro `_name` como input hidden.

##### Metodos

| Método | Parámetros | Descripción | Ejemplo |
|--------|------------|:------------|---------|
| khausNumberFormat | null | Agrega formato numérico a cualquier elemento dentro del DOM | \$('input').khausNumberFormat() |
| khausForm | null | Convierte los formularios en llamadas Ajax con control de errores | \$('form').khausForm() |