Khaus JS
=======
**Front End components compatible with laravel 5**

Add this code into layout, just before `</body>` tag

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
}
window.baseURL = "{!! URL::to('/') !!}/";
window.segment = ["{!! implode('", "', Request::segments()) !!}"];
</script>
```
