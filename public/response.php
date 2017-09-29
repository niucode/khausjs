<?php
// emula la respuesta de laravel con errores de formulario
http_response_code(302);
echo json_encode([
    'email.test' => 'email inválido'
]);
//$referer = $_SERVER['HTTP_REFERER'];
//header('Location: '.$referer);
