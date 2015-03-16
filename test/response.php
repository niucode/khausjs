<?php
// emula la respuesta de laravel con errores de formulario
http_response_code(422);
header('Content-Type: application/json');
echo file_get_contents('response3.json');